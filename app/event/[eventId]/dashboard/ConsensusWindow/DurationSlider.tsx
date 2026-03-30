/** Converts a total-minutes value into a readable label, e.g. 90 → "1 Hour 30 mins" */
function formatDurationToWords(mins: number): string {
  const hours = Math.floor(mins / 60);
  const remaining = mins % 60;

  if (hours === 0) return `${mins} min`;
  if (remaining === 0) return `${hours} Hour${hours !== 1 ? "s" : ""}`;
  return `${hours} Hour${hours !== 1 ? "s" : ""} ${remaining} min`;
}

interface DurationSliderProps {
  minDuration: number;
  maxDuration: number;
  onChange: (value: number) => void;
}

export default function DurationSlider({
  minDuration,
  maxDuration,
  onChange,
}: DurationSliderProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground font-main">
          Minimum duration
        </span>
        <span className="text-xs font-semibold font-main text-foreground tabular-nums">
          {formatDurationToWords(minDuration)}
        </span>
      </div>
      <input
        type="range"
        min={10}
        max={maxDuration}
        step={10}
        value={minDuration}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-primary cursor-pointer"
      />
      <div className="flex justify-between text-[10px] text-muted-foreground font-main">
        <span>10 min</span>
        <span>{maxDuration} min</span>
      </div>
    </div>
  );
}
