import type { Event, Participant, Photo, PhotoComment, Vote } from "@/lib/types";

export const demoEvent: Event = {
  id: "evt-demo",
  name: "Fiesta Aurora",
  slug: "fiesta-aurora",
  description: "Comparte los mejores momentos, vota tus favoritos y mira el ranking en directo.",
  cover_image:
    "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1400&q=80",
  is_active: true,
  uploads_enabled: true,
  created_at: new Date().toISOString()
};

export const demoParticipants: Participant[] = [
  { id: "p1", event_id: "evt-demo", display_name: "Lola", avatar_emoji: "✨", created_at: new Date().toISOString() },
  { id: "p2", event_id: "evt-demo", display_name: "Marcos", avatar_emoji: "🎧", created_at: new Date().toISOString() },
  { id: "p3", event_id: "evt-demo", display_name: "Nora", avatar_emoji: "🌸", created_at: new Date().toISOString() },
  { id: "p4", event_id: "evt-demo", display_name: "Alex", avatar_emoji: "⚡", created_at: new Date().toISOString() }
];

export const demoPhotos: Photo[] = [
  {
    id: "ph1",
    event_id: "evt-demo",
    participant_id: "p1",
    image_url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=80",
    title: "Luces y primer brindis",
    vote_count: 34,
    comment_count: 2,
    created_at: "2026-05-28T19:20:00.000Z",
    is_visible: true,
    is_featured: true,
    participant: demoParticipants[0]
  },
  {
    id: "ph2",
    event_id: "evt-demo",
    participant_id: "p2",
    image_url: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=900&q=80",
    title: "La pista empieza fuerte",
    vote_count: 28,
    comment_count: 1,
    created_at: "2026-05-28T19:34:00.000Z",
    is_visible: true,
    is_featured: true,
    participant: demoParticipants[1]
  },
  {
    id: "ph3",
    event_id: "evt-demo",
    participant_id: "p3",
    image_url: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=900&q=80",
    title: "Mesa con energia",
    vote_count: 21,
    comment_count: 1,
    created_at: "2026-05-28T19:45:00.000Z",
    is_visible: true,
    is_featured: false,
    participant: demoParticipants[2]
  },
  {
    id: "ph4",
    event_id: "evt-demo",
    participant_id: "p4",
    image_url: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=900&q=80",
    title: "Momento dorado",
    vote_count: 18,
    comment_count: 1,
    created_at: "2026-05-28T20:02:00.000Z",
    is_visible: true,
    is_featured: true,
    participant: demoParticipants[3]
  },
  {
    id: "ph5",
    event_id: "evt-demo",
    participant_id: "p1",
    image_url: "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=900&q=80",
    title: "Sonrisas de grupo",
    vote_count: 16,
    comment_count: 0,
    created_at: "2026-05-28T20:11:00.000Z",
    is_visible: true,
    is_featured: false,
    participant: demoParticipants[0]
  }
];

export const demoVotes: Vote[] = [
  { id: "v1", photo_id: "ph1", participant_id: "p2", created_at: new Date().toISOString() },
  { id: "v2", photo_id: "ph2", participant_id: "p1", created_at: new Date().toISOString() }
];

export const demoComments: PhotoComment[] = [
  {
    id: "c1",
    photo_id: "ph1",
    participant_id: "p2",
    text: "Este brindis resume la noche.",
    created_at: "2026-05-28T19:25:00.000Z",
    participant: demoParticipants[1]
  },
  {
    id: "c2",
    photo_id: "ph1",
    participant_id: "p3",
    text: "La luz quedo preciosa.",
    created_at: "2026-05-28T19:30:00.000Z",
    participant: demoParticipants[2]
  },
  {
    id: "c3",
    photo_id: "ph2",
    participant_id: "p4",
    text: "Aqui empezo todo.",
    created_at: "2026-05-28T19:38:00.000Z",
    participant: demoParticipants[3]
  },
  {
    id: "c4",
    photo_id: "ph4",
    participant_id: "p1",
    text: "Top momento del evento.",
    created_at: "2026-05-28T20:08:00.000Z",
    participant: demoParticipants[0]
  }
];
