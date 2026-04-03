import { ConsensusWindow, formatDurationToWords } from "./utils";
import WindowItem from "./WindowItem";

interface WindowListProps {
  windows: ConsensusWindow[];
  minDuration: number;
  adminTimezone: string;
}

export default function WindowList({
  windows,
  minDuration,
  adminTimezone,
}: WindowListProps) {
  if (windows.length === 0) {
    return (
      <p className="text-sm text-destructive text-center font-main py-1">
        No windows found where everyone is free for{" "}
        {formatDurationToWords(minDuration)}.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {windows.map((window, i) => (
        <WindowItem key={i} window={window} adminTimezone={adminTimezone} />
      ))}
    </div>
  );
}
