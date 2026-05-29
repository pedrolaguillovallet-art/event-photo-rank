import type { Photo } from "@/lib/types";
import { PhotoCard } from "@/components/PhotoCard";

export type GallerySort = "recent" | "votes" | "comments" | "featured" | "discover";

type PhotoGridProps = {
  photos: Photo[];
  likedPhotoIds: Set<string>;
  sortMode: GallerySort;
  onSortModeChange: (mode: GallerySort) => void;
  onOpen: (photo: Photo) => void;
  onToggleVote: (photoId: string) => void;
};

const sortOptions: Array<{ id: GallerySort; label: string; helper: string }> = [
  { id: "recent", label: "Recientes", helper: "Ultimas subidas" },
  { id: "votes", label: "Mas votadas", helper: "Favoritas del evento" },
  { id: "comments", label: "Mas comentadas", helper: "Conversacion activa" },
  { id: "featured", label: "Destacadas", helper: "Seleccion recomendada" },
  { id: "discover", label: "Descubrir", helper: "Orden aleatorio" }
];

export function PhotoGrid({ photos, likedPhotoIds, sortMode, onSortModeChange, onOpen, onToggleVote }: PhotoGridProps) {
  if (photos.length === 0) {
    return (
      <div className="cork-board min-h-[360px]">
        <div className="mx-auto max-w-sm rotate-[-1.5deg] rounded-[6px] bg-white p-8 text-center shadow-soft">
          <p className="text-xl font-black text-ink">Aun no hay fotos</p>
          <p className="mt-2 text-sm font-medium text-ink/60">Cuando alguien suba una imagen, aparecera aqui como una polaroid en el tablero.</p>
        </div>
      </div>
    );
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-violet">Galeria</p>
          <h2 className="mt-1 text-3xl font-black text-ink">Todas las fotos subidas</h2>
          <p className="mt-2 text-sm font-semibold text-ink/60">Vota, comenta y descubre los mejores momentos del evento.</p>
        </div>
        <p className="rounded-full bg-white px-4 py-2 text-sm font-black text-ink shadow-soft">{photos.length} fotos</p>
      </div>

      <div className="flex gap-2 overflow-x-auto rounded-[26px] bg-white p-2 shadow-soft">
        {sortOptions.map((option) => {
          const isActive = sortMode === option.id;
          return (
            <button
              key={option.id}
              className={`min-w-[142px] rounded-2xl px-4 py-3 text-left transition active:scale-[0.98] ${
                isActive ? "bg-ink text-white shadow-lift" : "bg-cream text-ink"
              }`}
              onClick={() => onSortModeChange(option.id)}
            >
              <span className="block text-sm font-black">{option.label}</span>
              <span className={`mt-1 block text-xs font-semibold ${isActive ? "text-white/70" : "text-ink/50"}`}>{option.helper}</span>
            </button>
          );
        })}
      </div>

      <div className="cork-board">
        <span className="cork-board-label">Top momentos del evento</span>
        <div className="masonry">
          {photos.map((photo) => (
            <PhotoCard
              key={photo.id}
              photo={photo}
              liked={likedPhotoIds.has(photo.id)}
              onOpen={onOpen}
              onToggleVote={onToggleVote}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
