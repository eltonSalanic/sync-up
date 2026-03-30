import { formatHour } from "./utils";

interface TimelineRowProps {
  totalHours: number;
}

export default function TimelineRow({ totalHours }: TimelineRowProps) {
  const hours = Array.from({ length: totalHours }, (_, i) => i);

  return (
    // Times Row
    <div
      className="h-8 grid border border-border rounded-b-md bg-card"
      style={{ gridTemplateColumns: `repeat(${totalHours}, 1fr)` }}
    >
      {hours.map((hour) => (
        <div
          key={`time-cell-${hour}`}
          className="relative border-l border-transparent"
        >
          {/* Hour Label - centered on the left edge of its cell */}
          <span
            className="absolute top-1/2 left-0 select-none text-[0.625rem] font-medium text-muted-foreground whitespace-nowrap leading-none px-[2px]"
            style={{
              // Align the first item to the left, center all others exactly over the grid line
              transform:
                hour === 0 ? "translate(0%, -50%)" : "translate(-50%, -50%)",
              fontFamily: "var(--font-accent)",
            }}
          >
            {formatHour(hour)}
          </span>

          {/* Hour tick - aligned to the left edge of the cell */}
          <div className="absolute top-0 left-0 w-px h-[4px] bg-border" />

          {/* Half-hour sub-tick - centered perfectly inside this 1-hour cell */}
          <div className="absolute top-0 left-1/2 w-px h-[3px] bg-border opacity-60" />
        </div>
      ))}
    </div>
  );
}
