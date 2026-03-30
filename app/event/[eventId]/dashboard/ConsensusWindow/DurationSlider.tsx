import { formatDurationToWords } from "./utils";

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
        <span>{formatDurationToWords(maxDuration)}</span>
      </div>
    </div>
  );
}
