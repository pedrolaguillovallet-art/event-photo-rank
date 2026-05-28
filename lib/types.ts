export type Event = {
  id: string;
  name: string;
  slug: string;
  description: string;
  cover_image: string;
  is_active: boolean;
  uploads_enabled: boolean;
  created_at: string;
};

export type Participant = {
  id: string;
  event_id: string;
  display_name: string;
  avatar_emoji: string;
  created_at: string;
};

export type Photo = {
  id: string;
  event_id: string;
  participant_id: string;
  image_url: string;
  title: string | null;
  vote_count: number;
  comment_count: number;
  created_at: string;
  is_visible: boolean;
  is_featured: boolean;
  participant?: Participant;
};

export type Vote = {
  id: string;
  photo_id: string;
  participant_id: string;
  created_at: string;
};

export type PhotoComment = {
  id: string;
  photo_id: string;
  participant_id: string;
  text: string;
  created_at: string;
  participant?: Participant;
};

export type PhotoRankingItem = Photo & {
  rank: number;
};

export type ParticipantRankingItem = Participant & {
  rank: number;
  total_votes: number;
  photo_count: number;
};
