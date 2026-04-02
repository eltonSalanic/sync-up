import { formatInTimezone } from "@/lib/time";
import { ConsensusWindow } from "./utils";

interface WindowItemProps {
  window: ConsensusWindow;
  adminTimezone: string;
}

export default function WindowItem({ window, adminTimezone }: WindowItemProps) {
  const startISO = window.start.toISOString();
  const endISO = window.end.toISOString();

  const dayLabel = formatInTimezone(startISO, adminTimezone, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const startLabel = formatInTimezone(startISO, adminTimezone, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const endLabel = formatInTimezone(endISO, adminTimezone, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div className="flex items-center gap-3 rounded-md border border-primary/40 bg-primary/10 px-4 py-2.5">
      {/* Accent bar */}
      <div className="w-1 self-stretch rounded-full bg-primary shrink-0" />

      <div className="min-w-0 space-y-0.5">
        <p className="text-xs text-muted-foreground font-main">{dayLabel}</p>
        <p className="text-sm font-medium font-main text-foreground">
          {startLabel}
          {" – "}
          {endLabel}
          <span className="ml-2 text-xs font-normal text-muted-foreground">
            ({window.durationMins} min)
          </span>
        </p>
      </div>
    </div>
  );
}
