import { Download, EyeOff, Lock, Trash2 } from "lucide-react";
import type { Event, Photo } from "@/lib/types";

type AdminPhotoTableProps = {
  event: Event;
  photos: Photo[];
  unlocked: boolean;
  password: string;
  onPasswordChange: (value: string) => void;
  onUnlock: () => void;
  onRemovePhoto: (photoId: string) => void;
  onToggleUploads: () => void;
  onExportCsv: () => void;
};

export function AdminPhotoTable({
  event,
  photos,
  unlocked,
  password,
  onPasswordChange,
  onUnlock,
  onRemovePhoto,
  onToggleUploads,
  onExportCsv
}: AdminPhotoTableProps) {
  if (!unlocked) {
    return (
      <section className="mx-auto max-w-md rounded-[28px] bg-white p-6 shadow-soft">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-ink text-white">
          <Lock size={24} />
        </div>
        <h2 className="mt-5 text-2xl font-black text-ink">Panel del organizador</h2>
        <p className="mt-2 text-sm font-semibold text-ink/60">Introduce la clave del evento para moderar fotos y exportar rankings.</p>
        <div className="mt-5 space-y-3">
          <input
            className="h-12 w-full rounded-2xl border border-ink/10 bg-cream px-4 font-semibold outline-none ring-violet/30 focus:ring-4"
            type="password"
            placeholder="Clave admin"
            value={password}
            onChange={(event) => onPasswordChange(event.target.value)}
          />
          <button className="h-12 w-full rounded-2xl bg-violet font-black text-white shadow-lift" onClick={onUnlock}>
            Entrar
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <div>
        <p className="text-sm font-black uppercase tracking-[0.18em] text-violet">Admin</p>
        <h2 className="mt-1 text-3xl font-black text-ink">Control del evento</h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <button className="rounded-[22px] bg-white p-4 text-left shadow-soft" onClick={onToggleUploads}>
          <p className="text-sm font-bold text-ink/60">Subidas</p>
          <p className="mt-1 text-xl font-black text-ink">{event.uploads_enabled ? "Activas" : "Pausadas"}</p>
        </button>
        <button className="rounded-[22px] bg-white p-4 text-left shadow-soft" onClick={onExportCsv}>
          <Download className="text-violet" size={22} />
          <p className="mt-2 text-xl font-black text-ink">Exportar CSV</p>
        </button>
        <div className="rounded-[22px] bg-white p-4 shadow-soft">
          <p className="text-sm font-bold text-ink/60">Fotos visibles</p>
          <p className="mt-1 text-xl font-black text-ink">{photos.length}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-[28px] bg-white shadow-soft">
        <div className="hidden grid-cols-[72px_1fr_90px_90px] gap-3 border-b border-ink/10 px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-ink/50 sm:grid">
          <span>Foto</span>
          <span>Info</span>
          <span>Votos</span>
          <span>Accion</span>
        </div>
        {photos.map((photo) => (
          <div key={photo.id} className="grid grid-cols-[64px_1fr_auto] gap-3 border-b border-ink/10 p-4 last:border-b-0 sm:grid-cols-[72px_1fr_90px_90px] sm:items-center">
            <img className="h-16 w-16 rounded-2xl object-cover" src={photo.image_url} alt="" />
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-ink">{photo.title ?? "Sin titulo"}</p>
              <p className="truncate text-xs font-semibold text-ink/55">{photo.participant?.display_name}</p>
            </div>
            <p className="hidden text-sm font-black text-coral sm:block">{photo.vote_count}</p>
            <button
              className="grid h-10 w-10 place-items-center rounded-full bg-cream text-coral"
              onClick={() => onRemovePhoto(photo.id)}
              title="Ocultar foto"
            >
              {photo.is_visible ? <EyeOff size={18} /> : <Trash2 size={18} />}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
