import { format } from "date-fns";
import { ConsensusWindow } from "./utils";

interface WindowItemProps {
  window: ConsensusWindow;
}

export default function WindowItem({ window }: WindowItemProps) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-primary/40 bg-primary/10 px-4 py-2.5">
      {/* Accent bar */}
      <div className="w-1 self-stretch rounded-full bg-primary shrink-0" />

      <div className="min-w-0 space-y-0.5">
        <p className="text-xs text-muted-foreground font-main">
          {format(window.start, "EEEE, MMMM d")}
        </p>
        <p className="text-sm font-medium font-main text-foreground">
          {format(window.start, "h:mm a")}
          {" – "}
          {format(window.end, "h:mm a")}
          <span className="ml-2 text-xs font-normal text-muted-foreground">
            ({window.durationMins} min)
          </span>
        </p>
      </div>
    </div>
  );
}
