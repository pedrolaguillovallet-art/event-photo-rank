"use client";

import { ChangeEvent, FormEvent, RefObject, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Camera, CheckCircle2, ExternalLink, PartyPopper, QrCode, Sparkles, UploadCloud, XCircle } from "lucide-react";
import { AdminPhotoTable } from "@/components/AdminPhotoTable";
import { EventHeader } from "@/components/EventHeader";
import { GallerySort, PhotoGrid } from "@/components/PhotoGrid";
import { PhotoModal } from "@/components/PhotoModal";
import { RankingList } from "@/components/RankingList";
import { UploadButton } from "@/components/UploadButton";
import { demoComments, demoEvent, demoParticipants, demoPhotos } from "@/lib/demo-data";
import { compressImage } from "@/lib/image";
import { buildParticipantRanking, buildPhotoRanking } from "@/lib/ranking";
import { isDemoMode, maxUploadMb } from "@/lib/supabase";
import {
  createComment,
  createParticipant,
  getEventBySlug,
  hidePhoto,
  listCommentsForEvent,
  listParticipants,
  listPhotos,
  listVotedPhotoIds,
  toggleVote as toggleSupabaseVote,
  updateEventSettings,
  updatePhotoFeatured,
  updateUploadsEnabled,
  uploadPhoto
} from "@/lib/supabase-repository";
import { supabase } from "@/lib/supabase";
import type { Event, Participant, Photo, PhotoComment } from "@/lib/types";

const avatarOptions = ["\u2728", "\ud83c\udfa7", "\ud83c\udf38", "\u26a1", "\ud83c\udf89", "\ud83c\udfc6", "\ud83d\udcab", "\ud83d\udcf8"];

const eventSlug = process.env.NEXT_PUBLIC_EVENT_SLUG ?? "fiesta-aurora";
const adminPasswordValue = process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? "3004";

function getParticipantStorageKey(eventId: string) {
  return `eventrank-participant-${eventId}`;
}

function readStoredParticipant(eventId: string) {
  try {
    const storedParticipant = window.localStorage.getItem(getParticipantStorageKey(eventId));
    if (!storedParticipant) return null;

    const parsedParticipant = JSON.parse(storedParticipant) as Participant;
    return parsedParticipant?.event_id === eventId && parsedParticipant.id && parsedParticipant.display_name ? parsedParticipant : null;
  } catch {
    window.localStorage.removeItem(getParticipantStorageKey(eventId));
    return null;
  }
}

function saveStoredParticipant(participant: Participant) {
  window.localStorage.setItem(getParticipantStorageKey(participant.event_id), JSON.stringify(participant));
}

export default function HomePage() {
  const [event, setEvent] = useState<Event>(demoEvent);
  const [participants, setParticipants] = useState<Participant[]>(demoParticipants);
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [avatarEmoji, setAvatarEmoji] = useState(avatarOptions[0]);
  const [photos, setPhotos] = useState<Photo[]>(demoPhotos);
  const [comments, setComments] = useState<PhotoComment[]>(demoComments);
  const [likedPhotoIds, setLikedPhotoIds] = useState<Set<string>>(new Set(["ph2"]));
  const [activeTab, setActiveTab] = useState("landing");
  const [lastNonProjectorTab, setLastNonProjectorTab] = useState("gallery");
  const [gallerySort, setGallerySort] = useState<GallerySort>("recent");
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [photoTitle, setPhotoTitle] = useState("");
  const [uploadState, setUploadState] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [appStatus, setAppStatus] = useState<"idle" | "loading" | "error">("idle");
  const [appMessage, setAppMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const visiblePhotos = useMemo(
    () => [...photos].filter((photo) => photo.is_visible).sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at)),
    [photos]
  );
  const sortedGalleryPhotos = useMemo(() => sortPhotos(visiblePhotos, gallerySort), [visiblePhotos, gallerySort]);
  const photoRanking = useMemo(() => buildPhotoRanking(photos), [photos]);
  const participantRanking = useMemo(() => buildParticipantRanking(photos, participants), [photos, participants]);
  const modalPhoto = selectedPhoto ? photos.find((photo) => photo.id === selectedPhoto.id) ?? null : null;
  const modalComments = useMemo(
    () =>
      modalPhoto
        ? comments
            .filter((comment) => comment.photo_id === modalPhoto.id)
            .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))
        : [],
    [comments, modalPhoto]
  );

  const refreshRemoteData = useCallback(async (targetEvent: Event, targetParticipant: Participant | null) => {
    const [remoteParticipants, remotePhotos, remoteComments, votedPhotoIds] = await Promise.all([
      listParticipants(targetEvent.id),
      listPhotos(targetEvent.id),
      listCommentsForEvent(targetEvent.id),
      targetParticipant ? listVotedPhotoIds(targetEvent.id, targetParticipant.id) : Promise.resolve([])
    ]);

    setParticipants(remoteParticipants);
    setPhotos(remotePhotos);
    setComments(remoteComments);
    setLikedPhotoIds(new Set(votedPhotoIds));
  }, []);

  useEffect(() => {
    if (isDemoMode || !supabase) return;

    let cancelled = false;

    async function bootstrap() {
      try {
        setAppStatus("loading");
        setAppMessage("Cargando evento...");
        const remoteEvent = await getEventBySlug(eventSlug);
        if (!remoteEvent) throw new Error("No se encontro el evento configurado.");
        if (cancelled) return;

        setEvent(remoteEvent);
        const parsedParticipant = readStoredParticipant(remoteEvent.id);

        if (parsedParticipant) {
          setParticipant(parsedParticipant);
          setDisplayName(parsedParticipant.display_name);
          setAvatarEmoji(parsedParticipant.avatar_emoji);
          await refreshRemoteData(remoteEvent, parsedParticipant);
          setActiveTab("gallery");
          setAppStatus("idle");
          setAppMessage("");
          return;
        }

        setParticipant(null);
        await refreshRemoteData(remoteEvent, null);
        if (!cancelled) {
          setAppStatus("idle");
          setAppMessage("");
        }
      } catch (error) {
        if (!cancelled) {
          setAppStatus("error");
          setAppMessage(error instanceof Error ? error.message : "No se pudo cargar el evento.");
        }
      }
    }

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, [refreshRemoteData]);

  useEffect(() => {
    if (isDemoMode || appStatus === "loading") return;
    const refreshInterval = window.setInterval(() => {
      refreshRemoteData(event, participant).catch(() => {
        setAppStatus("error");
        setAppMessage("No se pudieron refrescar las fotos. Revisa la conexion.");
      });
    }, 10000);

    return () => window.clearInterval(refreshInterval);
  }, [appStatus, event, participant, refreshRemoteData]);

  async function enterEvent(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    const cleanName = displayName.trim();
    if (!cleanName) return;

    try {
      setAppStatus("loading");
      setAppMessage("Creando tu acceso...");
      const nextParticipant: Participant = isDemoMode
        ? {
            id: crypto.randomUUID(),
            event_id: event.id,
            display_name: cleanName,
            avatar_emoji: avatarEmoji,
            created_at: new Date().toISOString()
          }
        : await createParticipant(event.id, cleanName, avatarEmoji);

      saveStoredParticipant(nextParticipant);
      setParticipants((current) => [nextParticipant, ...current.filter((item) => item.id !== nextParticipant.id)]);
      setParticipant(nextParticipant);
      setActiveTab("gallery");
      setAppStatus("idle");
      setAppMessage("");

      if (!isDemoMode) await refreshRemoteData(event, nextParticipant);
    } catch (error) {
      setAppStatus("error");
      setAppMessage(error instanceof Error ? error.message : "No se pudo entrar al evento.");
    }
  }

  async function onFileChange(changeEvent: ChangeEvent<HTMLInputElement>) {
    const file = changeEvent.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadState("error");
      return;
    }

    if (file.size > maxUploadMb * 1024 * 1024) {
      setUploadState("error");
      return;
    }

    const compressed = await compressImage(file);
    setSelectedFile(compressed);
    setPreviewUrl(URL.createObjectURL(compressed));
    setUploadState("idle");
  }

  async function uploadSelectedPhoto() {
    if (!selectedFile || !participant) return;
    setUploadState("uploading");

    try {
      const nextPhoto: Photo = isDemoMode
        ? {
            id: crypto.randomUUID(),
            event_id: event.id,
            participant_id: participant.id,
            image_url: previewUrl ?? "",
            title: photoTitle.trim() || null,
            vote_count: 0,
            comment_count: 0,
            created_at: new Date().toISOString(),
            is_visible: true,
            is_featured: false,
            participant
          }
        : await uploadPhoto(event.id, participant.id, selectedFile, photoTitle);

      setPhotos((current) => [nextPhoto, ...current]);
      setPhotoTitle("");
      setSelectedFile(null);
      setPreviewUrl(null);
      setUploadState("done");
      setActiveTab("gallery");

      if (!isDemoMode) await refreshRemoteData(event, participant);
    } catch {
      setUploadState("error");
    }
  }

  async function toggleVote(photoId: string) {
    if (!participant) {
      setActiveTab("join");
      return;
    }

    const alreadyLiked = likedPhotoIds.has(photoId);
    setLikedPhotoIds((current) => {
      const next = new Set(current);
      if (alreadyLiked) next.delete(photoId);
      else next.add(photoId);
      return next;
    });
    setPhotos((current) =>
      current.map((photo) =>
        photo.id === photoId ? { ...photo, vote_count: Math.max(0, photo.vote_count + (alreadyLiked ? -1 : 1)) } : photo
      )
    );

    if (!isDemoMode) {
      try {
        await toggleSupabaseVote(photoId, participant.id);
        await refreshRemoteData(event, participant);
      } catch (error) {
        setLikedPhotoIds((current) => {
          const next = new Set(current);
          if (alreadyLiked) next.add(photoId);
          else next.delete(photoId);
          return next;
        });
        setPhotos((current) =>
          current.map((photo) =>
            photo.id === photoId ? { ...photo, vote_count: Math.max(0, photo.vote_count + (alreadyLiked ? 1 : -1)) } : photo
          )
        );
        setAppStatus("error");
        setAppMessage(error instanceof Error ? error.message : "No se pudo guardar el voto.");
      }
    }
  }

  async function addComment(photoId: string, text: string) {
    if (!participant || !text.trim()) return false;

    try {
      const nextComment: PhotoComment = isDemoMode
        ? {
            id: crypto.randomUUID(),
            photo_id: photoId,
            participant_id: participant.id,
            text: text.trim().slice(0, 180),
            created_at: new Date().toISOString(),
            participant
          }
        : await createComment(photoId, participant.id, text);

      setComments((current) => [nextComment, ...current]);
      setPhotos((current) => current.map((photo) => (photo.id === photoId ? { ...photo, comment_count: photo.comment_count + 1 } : photo)));

      if (!isDemoMode) await refreshRemoteData(event, participant);
      return true;
    } catch (error) {
      setAppStatus("error");
      setAppMessage(error instanceof Error ? error.message : "No se pudo publicar el comentario.");
      return false;
    }
  }

  function openProjector() {
    setLastNonProjectorTab(activeTab === "landing" || activeTab === "join" ? "gallery" : activeTab);
    setActiveTab("projector");
  }

  function exportCsv() {
    const rows = [["posicion", "participante", "votos", "fotos"]];
    participantRanking.forEach((item) => rows.push([String(item.rank), item.display_name, String(item.total_votes), String(item.photo_count)]));
    const csv = rows.map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${event.slug}-ranking.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function removePhoto(photoId: string) {
    setPhotos((current) => current.map((photo) => (photo.id === photoId ? { ...photo, is_visible: false } : photo)));
    if (!isDemoMode) {
      try {
        await hidePhoto(photoId);
        await refreshRemoteData(event, participant);
      } catch (error) {
        setAppStatus("error");
        setAppMessage(error instanceof Error ? error.message : "No se pudo ocultar la foto.");
      }
    }
  }

  async function toggleFeaturedPhoto(photoId: string) {
    const targetPhoto = photos.find((photo) => photo.id === photoId);
    if (!targetPhoto) return;

    const nextValue = !targetPhoto.is_featured;
    setPhotos((current) => current.map((photo) => (photo.id === photoId ? { ...photo, is_featured: nextValue } : photo)));

    if (!isDemoMode) {
      try {
        const updatedPhoto = await updatePhotoFeatured(photoId, nextValue);
        setPhotos((current) => current.map((photo) => (photo.id === photoId ? updatedPhoto : photo)));
      } catch (error) {
        setPhotos((current) => current.map((photo) => (photo.id === photoId ? { ...photo, is_featured: !nextValue } : photo)));
        setAppStatus("error");
        setAppMessage(error instanceof Error ? error.message : "No se pudo destacar la foto.");
      }
    }
  }

  async function toggleUploads() {
    const nextValue = !event.uploads_enabled;
    setEvent((current) => ({ ...current, uploads_enabled: nextValue }));
    if (!isDemoMode) {
      try {
        const updatedEvent = await updateUploadsEnabled(event.id, nextValue);
        setEvent(updatedEvent);
      } catch (error) {
        setEvent((current) => ({ ...current, uploads_enabled: !nextValue }));
        setAppStatus("error");
        setAppMessage(error instanceof Error ? error.message : "No se pudo cambiar el estado de subidas.");
      }
    }
  }

  async function saveEventSettings(updates: Partial<Pick<Event, "name" | "description" | "cover_image" | "is_active" | "uploads_enabled">>) {
    const cleanedUpdates = {
      ...updates,
      name: updates.name?.trim() || event.name,
      description: updates.description?.trim() ?? event.description,
      cover_image: updates.cover_image?.trim() || event.cover_image
    };

    setEvent((current) => ({ ...current, ...cleanedUpdates }));
    if (!isDemoMode) {
      try {
        const updatedEvent = await updateEventSettings(event.id, cleanedUpdates);
        setEvent(updatedEvent);
        setAppStatus("idle");
        setAppMessage("");
      } catch (error) {
        setAppStatus("error");
        setAppMessage(error instanceof Error ? error.message : "No se pudieron guardar los ajustes.");
      }
    }
  }

  function renderContent() {
    if (activeTab === "landing") {
      return <Landing event={event} onJoin={() => setActiveTab("join")} onProjector={openProjector} />;
    }

    if (activeTab === "join") {
      return (
        <JoinScreen
          displayName={displayName}
          avatarEmoji={avatarEmoji}
          onDisplayNameChange={setDisplayName}
          onAvatarEmojiChange={setAvatarEmoji}
          onSubmit={enterEvent}
        />
      );
    }

    if (!event.is_active) {
      return <ClosedScreen event={event} />;
    }

    if (activeTab === "upload") {
      return (
        <UploadScreen
          uploadsEnabled={event.uploads_enabled}
          participant={participant}
          fileInputRef={fileInputRef}
          previewUrl={previewUrl}
          photoTitle={photoTitle}
          uploadState={uploadState}
          onChooseFile={() => fileInputRef.current?.click()}
          onFileChange={onFileChange}
          onTitleChange={setPhotoTitle}
          onUpload={uploadSelectedPhoto}
          onJoin={() => setActiveTab("join")}
        />
      );
    }

    if (activeTab === "ranking") {
      return <RankingList photoRanking={photoRanking} participantRanking={participantRanking} />;
    }

    if (activeTab === "profile") {
      return <ProfileScreen participant={participant} photos={photos} onJoin={() => setActiveTab("join")} />;
    }

    if (activeTab === "admin") {
      return (
        <AdminPhotoTable
          event={event}
          photos={visiblePhotos}
          unlocked={adminUnlocked}
          password={adminPassword}
          onPasswordChange={setAdminPassword}
          onUnlock={() => setAdminUnlocked(adminPassword === adminPasswordValue)}
          onRemovePhoto={removePhoto}
          onToggleFeatured={toggleFeaturedPhoto}
          onToggleUploads={toggleUploads}
          onSaveEventSettings={saveEventSettings}
          onExportCsv={exportCsv}
        />
      );
    }

    if (activeTab === "projector") {
      return (
        <ProjectorMode
          event={event}
          photos={visiblePhotos}
          photoRanking={photoRanking}
          participantRanking={participantRanking}
          onExit={() => setActiveTab(lastNonProjectorTab)}
        />
      );
    }

    return (
      <PhotoGrid
        photos={sortedGalleryPhotos}
        likedPhotoIds={likedPhotoIds}
        sortMode={gallerySort}
        onSortModeChange={setGallerySort}
        onOpen={setSelectedPhoto}
        onToggleVote={toggleVote}
      />
    );
  }

  return (
    <main className="min-h-screen pb-24">
      {activeTab !== "landing" && activeTab !== "join" && activeTab !== "projector" ? (
        <EventHeader event={event} participant={participant ?? undefined} activeTab={activeTab} onTabChange={setActiveTab} />
      ) : null}
      <div className="mx-auto max-w-6xl px-4 py-6">{renderContent()}</div>
      {appStatus !== "idle" && appMessage ? (
        <div
          className={`fixed left-1/2 top-4 z-50 max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-full px-5 py-3 text-sm font-black shadow-soft ${
            appStatus === "error" ? "bg-coral text-white" : "bg-white text-ink"
          }`}
        >
          {appMessage}
        </div>
      ) : null}
      {activeTab === "gallery" ? <UploadButton onClick={() => setActiveTab("upload")} disabled={!event.uploads_enabled} /> : null}
      <PhotoModal
        photo={modalPhoto}
        comments={modalComments}
        liked={modalPhoto ? likedPhotoIds.has(modalPhoto.id) : false}
        participant={participant}
        onClose={() => setSelectedPhoto(null)}
        onToggleVote={toggleVote}
        onSubmitComment={addComment}
        onJoin={() => {
          setSelectedPhoto(null);
          setActiveTab("join");
        }}
      />
    </main>
  );
}

function sortPhotos(photos: Photo[], sortMode: GallerySort) {
  const sorted = [...photos];

  if (sortMode === "votes") return sorted.sort((a, b) => b.vote_count - a.vote_count || +new Date(b.created_at) - +new Date(a.created_at));
  if (sortMode === "comments") {
    return sorted.sort((a, b) => b.comment_count - a.comment_count || b.vote_count - a.vote_count || +new Date(b.created_at) - +new Date(a.created_at));
  }
  if (sortMode === "featured") {
    return sorted.sort(
      (a, b) => Number(b.is_featured) - Number(a.is_featured) || b.vote_count - a.vote_count || +new Date(b.created_at) - +new Date(a.created_at)
    );
  }
  if (sortMode === "discover") {
    return sorted.sort((a, b) => discoverScore(b.id) - discoverScore(a.id));
  }

  return sorted.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
}

function discoverScore(id: string) {
  return id.split("").reduce((score, char, index) => score + char.charCodeAt(0) * (index + 3), 0) % 997;
}

function Landing({ event, onJoin, onProjector }: { event: Event; onJoin: () => void; onProjector: () => void }) {
  return (
    <section className="grid min-h-[calc(100vh-3rem)] items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-violet shadow-soft">
          <Sparkles size={17} />
          Fotos, votos y ranking en vivo
        </div>
        <div>
          <h1 className="max-w-3xl text-5xl font-black leading-tight text-ink sm:text-6xl">{event.name}</h1>
          <p className="mt-4 max-w-xl text-lg font-semibold leading-8 text-ink/65">{event.description}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button className="flex h-14 items-center justify-center gap-3 rounded-2xl bg-violet px-6 font-black text-white shadow-lift" onClick={onJoin}>
            <QrCode size={22} />
            Entrar al evento
          </button>
          <button className="flex h-14 items-center justify-center gap-3 rounded-2xl bg-white px-6 font-black text-ink shadow-soft" onClick={onProjector}>
            <ExternalLink size={21} />
            Modo proyector
          </button>
        </div>
      </div>
      <div className="overflow-hidden rounded-[32px] bg-white p-3 shadow-soft">
        <img className="h-[420px] w-full rounded-[24px] object-cover" src={event.cover_image} alt={event.name} />
      </div>
    </section>
  );
}

function JoinScreen({
  displayName,
  avatarEmoji,
  onDisplayNameChange,
  onAvatarEmojiChange,
  onSubmit
}: {
  displayName: string;
  avatarEmoji: string;
  onDisplayNameChange: (value: string) => void;
  onAvatarEmojiChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-md items-center">
      <form className="rounded-[32px] bg-white p-6 shadow-soft" onSubmit={onSubmit}>
        <div className="grid h-16 w-16 place-items-center rounded-3xl bg-violet text-3xl text-white shadow-lift">{avatarEmoji}</div>
        <h2 className="mt-5 text-3xl font-black text-ink">Entra en segundos</h2>
        <p className="mt-2 text-sm font-semibold text-ink/60">Pon tu nombre, elige tu energia y empieza a compartir.</p>
        <input
          className="mt-6 h-14 w-full rounded-2xl border border-ink/10 bg-cream px-4 text-lg font-bold outline-none ring-violet/30 focus:ring-4"
          placeholder="Tu nombre o apodo"
          value={displayName}
          onChange={(event) => onDisplayNameChange(event.target.value)}
          maxLength={24}
        />
        <div className="mt-4 grid grid-cols-4 gap-2">
          {avatarOptions.map((emoji) => (
            <button
              key={emoji}
              type="button"
              className={`grid h-12 place-items-center rounded-2xl text-2xl transition ${
                avatarEmoji === emoji ? "bg-violet text-white shadow-lift" : "bg-cream"
              }`}
              onClick={() => onAvatarEmojiChange(emoji)}
            >
              {emoji}
            </button>
          ))}
        </div>
        <button className="mt-6 h-14 w-full rounded-2xl bg-coral text-lg font-black text-white shadow-lift">Entrar y subir fotos</button>
        <p className="mt-4 rounded-2xl bg-cream p-4 text-sm font-semibold leading-6 text-ink/65">
          Guardaremos este acceso en este dispositivo para que no tengas que entrar otra vez.
        </p>
      </form>
    </section>
  );
}

function UploadScreen({
  uploadsEnabled,
  participant,
  fileInputRef,
  previewUrl,
  photoTitle,
  uploadState,
  onChooseFile,
  onFileChange,
  onTitleChange,
  onUpload,
  onJoin
}: {
  uploadsEnabled: boolean;
  participant: Participant | null;
  fileInputRef: RefObject<HTMLInputElement | null>;
  previewUrl: string | null;
  photoTitle: string;
  uploadState: "idle" | "uploading" | "done" | "error";
  onChooseFile: () => void;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onTitleChange: (value: string) => void;
  onUpload: () => void;
  onJoin: () => void;
}) {
  if (!participant) {
    return (
      <section className="rounded-[28px] bg-white p-6 text-center shadow-soft">
        <h2 className="text-2xl font-black text-ink">Primero dinos quien eres</h2>
        <p className="mt-2 text-sm font-semibold text-ink/60">Asi tus fotos apareceran con tu apodo.</p>
        <button className="mt-5 h-12 rounded-2xl bg-violet px-6 font-black text-white" onClick={onJoin}>
          Entrar al evento
        </button>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-2xl space-y-5">
      <div>
        <p className="text-sm font-black uppercase tracking-[0.18em] text-coral">Subida</p>
        <h2 className="mt-1 text-3xl font-black text-ink">Sube tu mejor momento</h2>
      </div>
      <div className="rounded-[30px] bg-white p-5 shadow-soft">
        <input ref={fileInputRef} className="hidden" type="file" accept="image/*,.heic,.heif" onChange={onFileChange} />
        <button
          className="grid min-h-72 w-full place-items-center rounded-[24px] border-2 border-dashed border-violet/30 bg-cream text-center"
          onClick={onChooseFile}
          disabled={!uploadsEnabled}
        >
          {previewUrl ? (
            <img className="max-h-80 w-full rounded-[22px] object-contain" src={previewUrl} alt="Previsualizacion" />
          ) : (
            <span className="space-y-3">
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-violet text-white">
                <UploadCloud size={28} />
              </span>
              <span className="block text-lg font-black text-ink">{uploadsEnabled ? "Camara o galeria" : "Las subidas estan pausadas"}</span>
              <span className="block text-sm font-semibold text-ink/55">Imagen hasta {maxUploadMb} MB</span>
            </span>
          )}
        </button>
        <input
          className="mt-4 h-12 w-full rounded-2xl border border-ink/10 bg-cream px-4 font-semibold outline-none ring-violet/30 focus:ring-4"
          placeholder="Titulo corto opcional"
          value={photoTitle}
          onChange={(event) => onTitleChange(event.target.value)}
          maxLength={70}
        />
        <button
          className="mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-violet text-lg font-black text-white shadow-lift disabled:bg-ink/30"
          onClick={onUpload}
          disabled={!previewUrl || uploadState === "uploading" || !uploadsEnabled}
        >
          <Camera size={22} />
          {uploadState === "uploading" ? "Subiendo..." : "Publicar foto"}
        </button>
        {uploadState === "done" ? <StatusLine tone="success" text="Foto publicada. Ya puede recibir votos." /> : null}
        {uploadState === "error" ? <StatusLine tone="error" text="Revisa que sea una imagen valida y no supere el tamano permitido." /> : null}
      </div>
    </section>
  );
}

function StatusLine({ tone, text }: { tone: "success" | "error"; text: string }) {
  const Icon = tone === "success" ? CheckCircle2 : XCircle;
  return (
    <p className={`mt-3 flex items-center gap-2 text-sm font-bold ${tone === "success" ? "text-emerald-600" : "text-coral"}`}>
      <Icon size={18} />
      {text}
    </p>
  );
}

function ProfileScreen({ participant, photos, onJoin }: { participant: Participant | null; photos: Photo[]; onJoin: () => void }) {
  if (!participant) {
    return (
      <section className="rounded-[28px] bg-white p-6 text-center shadow-soft">
        <h2 className="text-2xl font-black text-ink">Tu perfil del evento</h2>
        <button className="mt-5 h-12 rounded-2xl bg-violet px-6 font-black text-white" onClick={onJoin}>
          Crear perfil rapido
        </button>
      </section>
    );
  }

  const mine = photos.filter((photo) => photo.participant_id === participant.id);
  const votes = mine.reduce((sum, photo) => sum + photo.vote_count, 0);

  return (
    <section className="mx-auto max-w-xl rounded-[30px] bg-white p-6 shadow-soft">
      <div className="grid h-20 w-20 place-items-center rounded-[28px] bg-violet text-4xl text-white shadow-lift">{participant.avatar_emoji}</div>
      <h2 className="mt-5 text-3xl font-black text-ink">{participant.display_name}</h2>
      <p className="mt-2 text-sm font-semibold text-ink/60">Tu participacion en este evento.</p>
      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-cream p-4">
          <p className="text-sm font-bold text-ink/55">Fotos</p>
          <p className="text-3xl font-black text-ink">{mine.length}</p>
        </div>
        <div className="rounded-2xl bg-cream p-4">
          <p className="text-sm font-bold text-ink/55">Votos recibidos</p>
          <p className="text-3xl font-black text-coral">{votes}</p>
        </div>
      </div>
    </section>
  );
}

function ClosedScreen({ event }: { event: Event }) {
  return (
    <section className="mx-auto max-w-xl rounded-[30px] bg-white p-8 text-center shadow-soft">
      <PartyPopper className="mx-auto text-gold" size={44} />
      <h2 className="mt-4 text-3xl font-black text-ink">{event.name} ha finalizado</h2>
      <p className="mt-2 text-sm font-semibold text-ink/60">Gracias por compartir tantos momentos. El ranking queda guardado para el organizador.</p>
    </section>
  );
}

function ProjectorMode({
  event,
  photos,
  photoRanking,
  participantRanking,
  onExit
}: {
  event: Event;
  photos: Photo[];
  photoRanking: ReturnType<typeof buildPhotoRanking>;
  participantRanking: ReturnType<typeof buildParticipantRanking>;
  onExit: () => void;
}) {
  return (
    <section className="relative min-h-[calc(100vh-3rem)] rounded-[36px] bg-ink p-5 text-white shadow-soft sm:p-8">
      <button
        className="absolute right-4 top-4 z-10 flex h-11 items-center gap-2 rounded-full bg-white/15 px-4 text-sm font-black text-white backdrop-blur transition hover:bg-white/25"
        onClick={onExit}
      >
        <ArrowLeft size={17} />
        Salir del modo proyector
      </button>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-gold">Live wall</p>
          <h1 className="mt-2 text-4xl font-black sm:text-6xl">{event.name}</h1>
        </div>
        <p className="rounded-full bg-white/10 px-5 py-3 text-lg font-black">Vota tus fotos favoritas</p>
      </div>
      <div className="mt-8 grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {photos.slice(0, 6).map((photo) => (
            <img key={photo.id} className="aspect-square rounded-[24px] object-cover" src={photo.image_url} alt="" />
          ))}
        </div>
        <div className="space-y-4">
          <div className="rounded-[28px] bg-white/10 p-5">
            <h2 className="text-2xl font-black text-gold">Top 3 fotos</h2>
            <div className="mt-4 space-y-3">
              {photoRanking.slice(0, 3).map((photo, index) => (
                <div key={photo.id} className="flex items-center gap-3">
                  <span className="text-3xl">{["\ud83e\udd47", "\ud83e\udd48", "\ud83e\udd49"][index]}</span>
                  <p className="min-w-0 flex-1 truncate font-black">{photo.title ?? photo.participant?.display_name}</p>
                  <span className="font-black text-coral">{photo.vote_count}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[28px] bg-white/10 p-5">
            <h2 className="text-2xl font-black text-gold">Ranking en vivo</h2>
            <div className="mt-4 space-y-3">
              {participantRanking.slice(0, 5).map((participant) => (
                <div key={participant.id} className="flex items-center gap-3">
                  <span className="text-2xl">{participant.avatar_emoji}</span>
                  <p className="min-w-0 flex-1 truncate font-black">{participant.display_name}</p>
                  <span className="font-black text-coral">{participant.total_votes}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
