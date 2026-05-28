import { FormEvent, useState } from "react";
import { Heart, MessageCircle, Send, X } from "lucide-react";
import type { Participant, Photo, PhotoComment } from "@/lib/types";
import { ParticipantBadge } from "@/components/ParticipantBadge";

type PhotoModalProps = {
  photo: Photo | null;
  comments: PhotoComment[];
  liked: boolean;
  participant: Participant | null;
  onClose: () => void;
  onToggleVote: (photoId: string) => void;
  onSubmitComment: (photoId: string, text: string) => boolean | Promise<boolean>;
  onJoin: () => void;
};

const commentLimit = 180;

export function PhotoModal({ photo, comments, liked, participant, onClose, onToggleVote, onSubmitComment, onJoin }: PhotoModalProps) {
  const [commentText, setCommentText] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  if (!photo) return null;

  const date = new Intl.DateTimeFormat("es", {
    day: "2-digit",
    month: "long",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(photo.created_at));

  async function submitComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!photo) return;
    const cleanText = commentText.trim();
    if (!cleanText) {
      setMessage("Escribe un comentario antes de enviarlo.");
      return;
    }

    const published = await onSubmitComment(photo.id, cleanText);
    if (!published) {
      setMessage("Entra con tu nombre para comentar esta foto.");
      return;
    }

    setCommentText("");
    setMessage("Comentario publicado.");
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/75 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="max-h-[92vh] w-full max-w-6xl overflow-hidden rounded-[28px] bg-white shadow-soft">
        <div className="flex items-center justify-between gap-3 p-4">
          {photo.participant ? <ParticipantBadge participant={photo.participant} /> : <span />}
          <button className="grid h-10 w-10 place-items-center rounded-full bg-cream text-ink" onClick={onClose}>
            <X size={21} />
          </button>
        </div>
        <div className="grid max-h-[calc(92vh-72px)] overflow-y-auto lg:grid-cols-[1.2fr_0.8fr]">
          <div className="grid place-items-center bg-ink">
            <img className="max-h-[72vh] w-full object-contain" src={photo.image_url} alt={photo.title ?? "Foto ampliada"} />
          </div>
          <aside className="flex min-h-[420px] flex-col p-4">
            <div>
              <p className="text-xl font-black text-ink">{photo.title ?? "Momento sin titulo"}</p>
              <p className="mt-1 text-sm font-semibold text-ink/55">Subida el {date}</p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  className={`heart-pop flex h-12 items-center justify-center gap-2 rounded-2xl text-sm font-black transition active:scale-95 ${
                    liked ? "bg-coral text-white" : "bg-cream text-ink"
                  }`}
                  onClick={() => onToggleVote(photo.id)}
                  aria-pressed={liked}
                >
                  <Heart size={18} fill={liked ? "currentColor" : "none"} />
                  {photo.vote_count} votos
                </button>
                <div className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-cream text-sm font-black text-ink">
                  <MessageCircle size={18} />
                  {photo.comment_count} comentarios
                </div>
              </div>
            </div>

            <div className="mt-5 flex-1 space-y-3">
              <h3 className="text-sm font-black uppercase tracking-[0.16em] text-violet">Comentarios</h3>
              {comments.length === 0 ? (
                <p className="rounded-2xl bg-cream p-4 text-sm font-semibold text-ink/60">Todavia no hay comentarios. Se el primero en comentar este momento.</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="rounded-2xl bg-cream p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="min-w-0 truncate text-sm font-black text-ink">
                        {comment.participant?.avatar_emoji} {comment.participant?.display_name ?? "Invitado"}
                      </span>
                      <span className="shrink-0 text-xs font-bold text-ink/45">
                        {new Intl.DateTimeFormat("es", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(
                          new Date(comment.created_at)
                        )}
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-semibold leading-6 text-ink/70">{comment.text}</p>
                  </div>
                ))
              )}
            </div>

            <form className="mt-4 space-y-2" onSubmit={submitComment}>
              <textarea
                className="min-h-24 w-full resize-none rounded-2xl border border-ink/10 bg-cream p-3 text-sm font-semibold text-ink outline-none ring-violet/30 focus:ring-4"
                placeholder={participant ? "Escribe un comentario amable..." : "Entra con tu nombre para comentar"}
                value={commentText}
                onChange={(event) => {
                  setCommentText(event.target.value.slice(0, commentLimit));
                  setMessage(null);
                }}
                maxLength={commentLimit}
                disabled={!participant}
              />
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-bold text-ink/45">
                  {commentText.length}/{commentLimit}
                </span>
                {participant ? (
                  <button className="flex h-11 items-center gap-2 rounded-2xl bg-violet px-4 text-sm font-black text-white shadow-lift">
                    <Send size={16} />
                    Enviar
                  </button>
                ) : (
                  <button type="button" className="h-11 rounded-2xl bg-violet px-4 text-sm font-black text-white shadow-lift" onClick={onJoin}>
                    Entrar para comentar
                  </button>
                )}
              </div>
              {message ? <p className="text-sm font-bold text-ink/60">{message}</p> : null}
            </form>
          </aside>
        </div>
      </div>
    </div>
  );
}
