import { Download, EyeOff, Lock, Save, Sparkles, Trash2 } from "lucide-react";
import { useState } from "react";
import type { Event, Photo } from "@/lib/types";

type AdminPhotoTableProps = {
  event: Event;
  photos: Photo[];
  unlocked: boolean;
  password: string;
  onPasswordChange: (value: string) => void;
  onUnlock: () => void;
  onRemovePhoto: (photoId: string) => void;
  onToggleFeatured: (photoId: string) => void;
  onToggleUploads: () => void;
  onSaveEventSettings: (updates: Partial<Pick<Event, "name" | "description" | "cover_image" | "is_active" | "uploads_enabled">>) => void;
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
  onToggleFeatured,
  onToggleUploads,
  onSaveEventSettings,
  onExportCsv
}: AdminPhotoTableProps) {
  const [eventName, setEventName] = useState(event.name);
  const [eventDescription, setEventDescription] = useState(event.description);
  const [coverImage, setCoverImage] = useState(event.cover_image);
  const [isActive, setIsActive] = useState(event.is_active);
  const [uploadsEnabled, setUploadsEnabled] = useState(event.uploads_enabled);

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

      <div className="grid gap-3 sm:grid-cols-4">
        <button
          className="rounded-[22px] bg-white p-4 text-left shadow-soft"
          onClick={() => {
            setUploadsEnabled((current) => !current);
            onToggleUploads();
          }}
        >
          <p className="text-sm font-bold text-ink/60">Subidas</p>
          <p className="mt-1 text-xl font-black text-ink">{event.uploads_enabled ? "Activas" : "Pausadas"}</p>
        </button>
        <div className="rounded-[22px] bg-white p-4 shadow-soft">
          <p className="text-sm font-bold text-ink/60">Estado</p>
          <p className="mt-1 text-xl font-black text-ink">{event.is_active ? "Abierto" : "Cerrado"}</p>
        </div>
        <button className="rounded-[22px] bg-white p-4 text-left shadow-soft" onClick={onExportCsv}>
          <Download className="text-violet" size={22} />
          <p className="mt-2 text-xl font-black text-ink">Exportar CSV</p>
        </button>
        <div className="rounded-[22px] bg-white p-4 shadow-soft">
          <p className="text-sm font-bold text-ink/60">Fotos visibles</p>
          <p className="mt-1 text-xl font-black text-ink">{photos.length}</p>
        </div>
      </div>

      <div className="rounded-[28px] bg-white p-5 shadow-soft">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-xl font-black text-ink">Ajustes del evento</h3>
            <p className="mt-1 text-sm font-semibold text-ink/55">Modifica nombre, descripcion, portada y estado del evento.</p>
          </div>
          <button
            className="flex h-11 items-center justify-center gap-2 rounded-2xl bg-violet px-4 text-sm font-black text-white shadow-lift"
            onClick={() =>
              onSaveEventSettings({
                name: eventName.trim(),
                description: eventDescription.trim(),
                cover_image: coverImage.trim(),
                is_active: isActive,
                uploads_enabled: uploadsEnabled
              })
            }
          >
            <Save size={17} />
            Guardar ajustes
          </button>
        </div>
        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          <label className="space-y-2 lg:col-span-2">
            <span className="text-xs font-black uppercase tracking-[0.12em] text-ink/45">Enlace publico</span>
            <input
              className="h-12 w-full rounded-2xl border border-ink/10 bg-cream px-4 font-semibold text-ink/60 outline-none"
              value={`/${event.slug}`}
              readOnly
            />
          </label>
          <label className="space-y-2">
            <span className="text-xs font-black uppercase tracking-[0.12em] text-ink/45">Nombre</span>
            <input
              className="h-12 w-full rounded-2xl border border-ink/10 bg-cream px-4 font-semibold outline-none ring-violet/30 focus:ring-4"
              value={eventName}
              onChange={(event) => setEventName(event.target.value)}
            />
          </label>
          <label className="space-y-2">
            <span className="text-xs font-black uppercase tracking-[0.12em] text-ink/45">Imagen de portada</span>
            <input
              className="h-12 w-full rounded-2xl border border-ink/10 bg-cream px-4 font-semibold outline-none ring-violet/30 focus:ring-4"
              value={coverImage}
              onChange={(event) => setCoverImage(event.target.value)}
            />
          </label>
          <div className="overflow-hidden rounded-2xl bg-cream lg:col-span-2">
            <img className="h-44 w-full object-cover" src={coverImage || event.cover_image} alt="Previsualizacion de portada" />
          </div>
          <label className="space-y-2 lg:col-span-2">
            <span className="text-xs font-black uppercase tracking-[0.12em] text-ink/45">Descripcion</span>
            <textarea
              className="min-h-24 w-full resize-none rounded-2xl border border-ink/10 bg-cream p-4 font-semibold outline-none ring-violet/30 focus:ring-4"
              value={eventDescription}
              onChange={(event) => setEventDescription(event.target.value)}
            />
          </label>
          <label className="flex items-center justify-between gap-3 rounded-2xl bg-cream p-4">
            <span>
              <span className="block text-sm font-black text-ink">Evento activo</span>
              <span className="block text-xs font-semibold text-ink/55">Si se desactiva, se muestra la pantalla de finalizado.</span>
            </span>
            <input className="h-5 w-5 accent-violet" type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} />
          </label>
          <label className="flex items-center justify-between gap-3 rounded-2xl bg-cream p-4">
            <span>
              <span className="block text-sm font-black text-ink">Permitir subidas</span>
              <span className="block text-xs font-semibold text-ink/55">Controla si los asistentes pueden publicar fotos.</span>
            </span>
            <input
              className="h-5 w-5 accent-violet"
              type="checkbox"
              checked={uploadsEnabled}
              onChange={(event) => setUploadsEnabled(event.target.checked)}
            />
          </label>
        </div>
      </div>

      <div className="overflow-hidden rounded-[28px] bg-white shadow-soft">
        <div className="hidden grid-cols-[72px_1fr_90px_100px_90px] gap-3 border-b border-ink/10 px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-ink/50 sm:grid">
          <span>Foto</span>
          <span>Info</span>
          <span>Votos</span>
          <span>Destacada</span>
          <span>Accion</span>
        </div>
        {photos.map((photo) => (
          <div key={photo.id} className="grid grid-cols-[64px_1fr_auto] gap-3 border-b border-ink/10 p-4 last:border-b-0 sm:grid-cols-[72px_1fr_90px_100px_90px] sm:items-center">
            <img className="h-16 w-16 rounded-2xl object-cover" src={photo.image_url} alt="" />
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-ink">{photo.title ?? "Sin titulo"}</p>
              <p className="truncate text-xs font-semibold text-ink/55">{photo.participant?.display_name}</p>
            </div>
            <p className="hidden text-sm font-black text-coral sm:block">{photo.vote_count}</p>
            <button
              className={`flex h-10 items-center justify-center gap-1 rounded-full px-3 text-xs font-black ${
                photo.is_featured ? "bg-gold text-ink" : "bg-cream text-ink/60"
              }`}
              onClick={() => onToggleFeatured(photo.id)}
              title={photo.is_featured ? "Quitar destacada" : "Marcar como destacada"}
            >
              <Sparkles size={15} />
              {photo.is_featured ? "Si" : "No"}
            </button>
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
