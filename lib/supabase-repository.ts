import { supabase } from "@/lib/supabase";
import type { Event, Participant, Photo, PhotoComment } from "@/lib/types";

export async function getEventBySlug(slug: string): Promise<Event | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from("events").select("*").eq("slug", slug).single();
  if (error) throw error;
  return data;
}

export async function createParticipant(eventId: string, displayName: string, avatarEmoji: string, authUserId?: string | null): Promise<Participant> {
  if (!supabase) throw new Error("Supabase no esta configurado.");
  const { data, error } = await supabase
    .from("participants")
    .insert({ event_id: eventId, display_name: displayName, avatar_emoji: avatarEmoji, auth_user_id: authUserId ?? null })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function getParticipantByAuthUser(eventId: string, authUserId: string): Promise<Participant | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("participants")
    .select("*")
    .eq("event_id", eventId)
    .eq("auth_user_id", authUserId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function listParticipants(eventId: string): Promise<Participant[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.from("participants").select("*").eq("event_id", eventId).order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function listPhotos(eventId: string): Promise<Photo[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("photos")
    .select("*, participant:participants(*)")
    .eq("event_id", eventId)
    .eq("is_visible", true)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function listCommentsForEvent(eventId: string): Promise<PhotoComment[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("comments")
    .select("*, participant:participants(*), photo:photos!inner(event_id)")
    .eq("photo.event_id", eventId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(({ photo: _photo, ...comment }) => comment as PhotoComment);
}

export async function listVotedPhotoIds(eventId: string, participantId: string): Promise<string[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("votes")
    .select("photo_id, photo:photos!inner(event_id)")
    .eq("participant_id", participantId)
    .eq("photo.event_id", eventId);
  if (error) throw error;
  return (data ?? []).map((vote) => vote.photo_id);
}

export async function uploadPhoto(eventId: string, participantId: string, file: File, title?: string): Promise<Photo> {
  if (!supabase) throw new Error("Supabase no esta configurado.");

  const extension = file.name.split(".").pop() ?? "jpg";
  const path = `${eventId}/${participantId}/${crypto.randomUUID()}.${extension}`;
  const upload = await supabase.storage.from("event-photos").upload(path, file, {
    cacheControl: "3600",
    upsert: false
  });

  if (upload.error) throw upload.error;

  const { data: publicUrl } = supabase.storage.from("event-photos").getPublicUrl(path);
  const { data, error } = await supabase
    .from("photos")
    .insert({
      event_id: eventId,
      participant_id: participantId,
      image_url: publicUrl.publicUrl,
      title: title?.trim() || null,
      comment_count: 0,
      is_featured: false
    })
    .select("*, participant:participants(*)")
    .single();

  if (error) throw error;
  return data;
}

export async function toggleVote(photoId: string, participantId: string): Promise<void> {
  if (!supabase) throw new Error("Supabase no esta configurado.");

  const { data: existing, error } = await supabase
    .from("votes")
    .select("id")
    .eq("photo_id", photoId)
    .eq("participant_id", participantId)
    .maybeSingle();
  if (error) throw error;

  if (existing) {
    const removal = await supabase.from("votes").delete().eq("id", existing.id);
    if (removal.error) throw removal.error;
    return;
  }

  const insert = await supabase.from("votes").insert({ photo_id: photoId, participant_id: participantId });
  if (insert.error) throw insert.error;
}

export async function listComments(photoId: string): Promise<PhotoComment[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("comments")
    .select("*, participant:participants(*)")
    .eq("photo_id", photoId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createComment(photoId: string, participantId: string, text: string): Promise<PhotoComment> {
  if (!supabase) throw new Error("Supabase no esta configurado.");
  const { data, error } = await supabase
    .from("comments")
    .insert({ photo_id: photoId, participant_id: participantId, text: text.trim().slice(0, 180) })
    .select("*, participant:participants(*)")
    .single();
  if (error) throw error;
  return data;
}

export async function hidePhoto(photoId: string): Promise<void> {
  if (!supabase) throw new Error("Supabase no esta configurado.");
  const rpcResult = await supabase.rpc("admin_hide_photo", { target_photo_id: photoId });
  if (!rpcResult.error) return;

  const { error } = await supabase.from("photos").update({ is_visible: false }).eq("id", photoId);
  if (error) throw rpcResult.error;
}

export async function updatePhotoFeatured(photoId: string, isFeatured: boolean): Promise<Photo> {
  if (!supabase) throw new Error("Supabase no esta configurado.");
  const { data, error } = await supabase
    .from("photos")
    .update({ is_featured: isFeatured })
    .eq("id", photoId)
    .select("*, participant:participants(*)")
    .single();
  if (error) throw error;
  return data;
}

export async function updateUploadsEnabled(eventId: string, uploadsEnabled: boolean): Promise<Event> {
  if (!supabase) throw new Error("Supabase no esta configurado.");
  const rpcResult = await supabase.rpc("admin_update_uploads_enabled", {
    target_event_id: eventId,
    next_uploads_enabled: uploadsEnabled
  });

  if (!rpcResult.error) return rpcResult.data as Event;

  const { data, error } = await supabase
    .from("events")
    .update({ uploads_enabled: uploadsEnabled })
    .eq("id", eventId)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function updateEventSettings(eventId: string, updates: Partial<Pick<Event, "name" | "description" | "cover_image" | "is_active" | "uploads_enabled">>): Promise<Event> {
  if (!supabase) throw new Error("Supabase no esta configurado.");
  const rpcResult = await supabase.rpc("admin_update_event_settings", {
    target_event_id: eventId,
    next_name: updates.name ?? null,
    next_description: updates.description ?? null,
    next_cover_image: updates.cover_image ?? null,
    next_is_active: updates.is_active ?? null,
    next_uploads_enabled: updates.uploads_enabled ?? null
  });

  if (!rpcResult.error) return rpcResult.data as Event;

  const { data, error } = await supabase.from("events").update(updates).eq("id", eventId).select("*").single();
  if (error) throw error;
  return data;
}
