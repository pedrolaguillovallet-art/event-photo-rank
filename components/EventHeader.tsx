import { Camera, Crown, Image, Settings, Trophy, UserRound } from "lucide-react";
import type { Event, Participant } from "@/lib/types";
import { ParticipantBadge } from "@/components/ParticipantBadge";

type EventHeaderProps = {
  event: Event;
  participant?: Participant;
  activeTab: string;
  onTabChange: (tab: string) => void;
};

const tabs = [
  { id: "gallery", label: "Galeria", icon: Image },
  { id: "upload", label: "Subir", icon: Camera },
  { id: "ranking", label: "Ranking", icon: Trophy },
  { id: "profile", label: "Perfil", icon: UserRound },
  { id: "admin", label: "Admin", icon: Settings }
];

export function EventHeader({ event, participant, activeTab, onTabChange }: EventHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/70 bg-cream/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <button className="flex min-w-0 items-center gap-3 text-left" onClick={() => onTabChange("gallery")}>
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-violet text-white shadow-lift">
            <Crown size={22} />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-base font-black text-ink">{event.name}</span>
            <span className="block truncate text-xs font-medium text-ink/60">Top momentos del evento</span>
          </span>
        </button>
        {participant ? <ParticipantBadge participant={participant} compact /> : null}
      </div>
      <nav className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 pb-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              className={`flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-bold transition ${
                isActive ? "bg-ink text-white shadow-soft" : "bg-white/80 text-ink/70"
              }`}
              onClick={() => onTabChange(tab.id)}
            >
              <Icon size={17} />
              {tab.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
