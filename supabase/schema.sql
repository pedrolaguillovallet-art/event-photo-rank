create extension if not exists "pgcrypto";

insert into storage.buckets (id, name, public)
values ('event-photos', 'event-photos', true)
on conflict (id) do update set public = true;

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null default '',
  cover_image text,
  is_active boolean not null default true,
  uploads_enabled boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.participants (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 40),
  avatar_emoji text not null default '✨',
  created_at timestamptz not null default now()
);

create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  participant_id uuid not null references public.participants(id) on delete cascade,
  image_url text not null,
  title text check (title is null or char_length(title) <= 90),
  vote_count integer not null default 0,
  comment_count integer not null default 0,
  created_at timestamptz not null default now(),
  is_visible boolean not null default true,
  is_featured boolean not null default false
);

create table if not exists public.votes (
  id uuid primary key default gen_random_uuid(),
  photo_id uuid not null references public.photos(id) on delete cascade,
  participant_id uuid not null references public.participants(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (photo_id, participant_id)
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  photo_id uuid not null references public.photos(id) on delete cascade,
  participant_id uuid not null references public.participants(id) on delete cascade,
  text text not null check (char_length(trim(text)) between 1 and 180),
  created_at timestamptz not null default now()
);

create index if not exists photos_event_created_idx on public.photos(event_id, created_at desc);
create index if not exists photos_event_votes_idx on public.photos(event_id, vote_count desc);
create index if not exists participants_event_idx on public.participants(event_id);
create index if not exists votes_photo_idx on public.votes(photo_id);
create index if not exists comments_photo_created_idx on public.comments(photo_id, created_at desc);

create or replace function public.sync_photo_vote_count()
returns trigger
language plpgsql
security definer
as $$
begin
  if tg_op = 'INSERT' then
    update public.photos
      set vote_count = vote_count + 1
      where id = new.photo_id;
    return new;
  end if;

  if tg_op = 'DELETE' then
    update public.photos
      set vote_count = greatest(0, vote_count - 1)
      where id = old.photo_id;
    return old;
  end if;

  return null;
end;
$$;

drop trigger if exists votes_sync_photo_count_insert on public.votes;
create trigger votes_sync_photo_count_insert
after insert on public.votes
for each row execute function public.sync_photo_vote_count();

drop trigger if exists votes_sync_photo_count_delete on public.votes;
create trigger votes_sync_photo_count_delete
after delete on public.votes
for each row execute function public.sync_photo_vote_count();

create or replace function public.sync_photo_comment_count()
returns trigger
language plpgsql
security definer
as $$
begin
  if tg_op = 'INSERT' then
    update public.photos
      set comment_count = comment_count + 1
      where id = new.photo_id;
    return new;
  end if;

  if tg_op = 'DELETE' then
    update public.photos
      set comment_count = greatest(0, comment_count - 1)
      where id = old.photo_id;
    return old;
  end if;

  return null;
end;
$$;

drop trigger if exists comments_sync_photo_count_insert on public.comments;
create trigger comments_sync_photo_count_insert
after insert on public.comments
for each row execute function public.sync_photo_comment_count();

drop trigger if exists comments_sync_photo_count_delete on public.comments;
create trigger comments_sync_photo_count_delete
after delete on public.comments
for each row execute function public.sync_photo_comment_count();

alter table public.events enable row level security;
alter table public.participants enable row level security;
alter table public.photos enable row level security;
alter table public.votes enable row level security;
alter table public.comments enable row level security;

create policy "events are readable" on public.events
for select using (true);

create policy "events can be updated by admin mvp" on public.events
for update using (true)
with check (true);

create policy "participants are readable" on public.participants
for select using (true);

create policy "participants can join" on public.participants
for insert with check (true);

create policy "photos are readable when visible" on public.photos
for select using (is_visible = true);

create policy "participants can upload photos" on public.photos
for insert with check (
  exists (
    select 1
    from public.events
    where events.id = photos.event_id
      and events.is_active = true
      and events.uploads_enabled = true
  )
);

create policy "photos can be moderated by admin mvp" on public.photos
for update using (true)
with check (true);

create policy "votes are readable" on public.votes
for select using (true);

create policy "participants can vote" on public.votes
for insert with check (true);

create policy "participants can remove own votes" on public.votes
for delete using (true);

create policy "comments are readable" on public.comments
for select using (true);

create policy "participants can comment" on public.comments
for insert with check (
  char_length(trim(text)) between 1 and 180
);

create policy "event photos are publicly readable" on storage.objects
for select using (bucket_id = 'event-photos');

create policy "participants can upload event photos" on storage.objects
for insert with check (bucket_id = 'event-photos');

insert into public.events (name, slug, description, cover_image)
values (
  'Fiesta Aurora',
  'fiesta-aurora',
  'Comparte los mejores momentos, vota tus favoritos y mira el ranking en directo.',
  'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1400&q=80'
)
on conflict (slug) do nothing;
