import { ConsensusWindow } from "./utils";
import WindowItem from "./WindowItem";

interface WindowListProps {
  windows: ConsensusWindow[];
  minDuration: number;
}

export default function WindowList({ windows, minDuration }: WindowListProps) {
  if (windows.length === 0) {
    return (
      <p className="text-sm text-muted-foreground font-main py-1">
        No windows found where everyone is free for {minDuration} min.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {windows.map((window, i) => (
        <WindowItem key={i} window={window} />
      ))}
    </div>
  );
}
