import { Camera, Heart, Trophy } from "lucide-react";
import type { ParticipantRankingItem, PhotoRankingItem } from "@/lib/types";
import { ParticipantBadge } from "@/components/ParticipantBadge";

type RankingListProps = {
  photoRanking: PhotoRankingItem[];
  participantRanking: ParticipantRankingItem[];
};

const medals = ["🥇", "🥈", "🥉"];

export function RankingList({ photoRanking, participantRanking }: RankingListProps) {
  return (
    <section className="space-y-5">
      <div>
        <p className="text-sm font-black uppercase tracking-[0.18em] text-coral">Ranking</p>
        <h2 className="mt-1 text-3xl font-black text-ink">El ranking esta que arde</h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {photoRanking.slice(0, 3).map((photo, index) => (
          <div key={photo.id} className="overflow-hidden rounded-[26px] bg-white shadow-soft">
            <div className="relative">
              <img className="h-44 w-full object-cover" src={photo.image_url} alt={photo.title ?? "Foto destacada"} />
              <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-2 text-2xl shadow-soft">{medals[index]}</span>
            </div>
            <div className="space-y-3 p-4">
              <p className="truncate text-sm font-black text-ink">{photo.title ?? "Foto destacada"}</p>
              <div className="flex items-center justify-between gap-3 text-sm font-bold text-ink/70">
                <span>{photo.participant?.display_name}</span>
                <span className="flex items-center gap-1 text-coral">
                  <Heart size={16} fill="currentColor" />
                  {photo.vote_count}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-[28px] bg-white p-4 shadow-soft">
          <h3 className="flex items-center gap-2 text-lg font-black text-ink">
            <Camera size={20} />
            Top fotos
          </h3>
          <div className="mt-4 space-y-3">
            {photoRanking.map((photo) => (
              <div key={photo.id} className="flex items-center gap-3 rounded-2xl bg-cream p-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white font-black text-ink">{photo.rank}</span>
                <img className="h-12 w-12 shrink-0 rounded-xl object-cover" src={photo.image_url} alt="" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-black text-ink">{photo.title ?? "Sin titulo"}</p>
                  <p className="truncate text-xs font-semibold text-ink/55">{photo.participant?.display_name}</p>
                </div>
                <span className="shrink-0 text-sm font-black text-coral">{photo.vote_count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] bg-white p-4 shadow-soft">
          <h3 className="flex items-center gap-2 text-lg font-black text-ink">
            <Trophy size={20} />
            Top participantes
          </h3>
          <div className="mt-4 space-y-3">
            {participantRanking.map((participant) => (
              <div key={participant.id} className="flex items-center gap-3 rounded-2xl bg-cream p-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white font-black text-ink">
                  {medals[participant.rank - 1] ?? participant.rank}
                </span>
                <div className="min-w-0 flex-1">
                  <ParticipantBadge participant={participant} compact />
                  <p className="mt-1 text-xs font-semibold text-ink/55">{participant.photo_count} fotos subidas</p>
                </div>
                <span className="shrink-0 text-sm font-black text-coral">{participant.total_votes}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
