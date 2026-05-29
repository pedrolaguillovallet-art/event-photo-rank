import { CalendarDays, Heart, MessageCircle, Sparkles } from "lucide-react";
import type { Photo } from "@/lib/types";
import { ParticipantBadge } from "@/components/ParticipantBadge";

type PhotoCardProps = {
  photo: Photo;
  liked: boolean;
  onOpen: (photo: Photo) => void;
  onToggleVote: (photoId: string) => void;
};

export function PhotoCard({ photo, liked, onOpen, onToggleVote }: PhotoCardProps) {
  const date = new Intl.DateTimeFormat("es", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(photo.created_at));

  return (
    <article className="polaroid-card masonry-item relative mb-5 transition duration-200">
      <span className="pushpin" aria-hidden="true" />
      <button className="relative block w-full overflow-hidden bg-ink text-left shadow-inner" onClick={() => onOpen(photo)}>
        <img className="aspect-[4/3] w-full object-cover" src={photo.image_url} alt={photo.title ?? "Foto del evento"} />
        {photo.is_featured ? (
          <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-white/95 px-3 py-2 text-xs font-black text-violet shadow-soft">
            <Sparkles size={14} />
            Destacada
          </span>
        ) : null}
      </button>
      <div className="space-y-3 pt-4">
        {photo.participant ? <ParticipantBadge participant={photo.participant} compact /> : null}
        <p className="min-h-5 text-center text-sm font-semibold text-ink/80">{photo.title || "Momento del evento"}</p>
        <div className="grid grid-cols-3 gap-2 text-xs font-black text-ink/60">
          <span className="flex items-center justify-center gap-1 rounded-full bg-[#f4eadb] px-2 py-2">
            <CalendarDays size={14} />
            {date}
          </span>
          <span className="flex items-center justify-center gap-1 rounded-full bg-[#f4eadb] px-2 py-2">
            <Heart size={14} />
            {photo.vote_count}
          </span>
          <span className="flex items-center justify-center gap-1 rounded-full bg-[#f4eadb] px-2 py-2">
            <MessageCircle size={14} />
            {photo.comment_count}
          </span>
        </div>
        <button
          className={`heart-pop flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-black transition active:scale-95 ${
            liked ? "bg-coral text-white" : "bg-cream text-ink"
          }`}
          onClick={() => onToggleVote(photo.id)}
          aria-pressed={liked}
        >
          <Heart size={19} fill={liked ? "currentColor" : "none"} />
          {photo.vote_count} me gusta
        </button>
      </div>
    </article>
  );
}
