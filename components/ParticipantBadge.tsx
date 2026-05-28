import type { Participant } from "@/lib/types";

type ParticipantBadgeProps = {
  participant: Participant;
  compact?: boolean;
};

export function ParticipantBadge({ participant, compact = false }: ParticipantBadgeProps) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <span
        className={`grid shrink-0 place-items-center rounded-full bg-white shadow-sm ${
          compact ? "h-8 w-8 text-base" : "h-10 w-10 text-xl"
        }`}
        aria-hidden="true"
      >
        {participant.avatar_emoji}
      </span>
      <span className="truncate font-semibold text-ink">{participant.display_name}</span>
    </div>
  );
}
