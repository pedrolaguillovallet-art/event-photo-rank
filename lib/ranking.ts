import type { Participant, ParticipantRankingItem, Photo, PhotoRankingItem } from "@/lib/types";

export function buildPhotoRanking(photos: Photo[]): PhotoRankingItem[] {
  return [...photos]
    .filter((photo) => photo.is_visible)
    .sort((a, b) => b.vote_count - a.vote_count)
    .map((photo, index) => ({ ...photo, rank: index + 1 }));
}

export function buildParticipantRanking(photos: Photo[], participants: Participant[]): ParticipantRankingItem[] {
  return participants
    .map((participant) => {
      const participantPhotos = photos.filter((photo) => photo.participant_id === participant.id && photo.is_visible);
      return {
        ...participant,
        total_votes: participantPhotos.reduce((sum, photo) => sum + photo.vote_count, 0),
        photo_count: participantPhotos.length,
        rank: 0
      };
    })
    .sort((a, b) => b.total_votes - a.total_votes)
    .map((participant, index) => ({ ...participant, rank: index + 1 }));
}
