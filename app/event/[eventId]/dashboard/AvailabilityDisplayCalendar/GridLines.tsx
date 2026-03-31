interface GridLinesProps {
  totalHours: number;
}

/**
 * Absolutely-positioned overlay that draws vertical guide lines across a row.
 * Uses the same totalHours grid as TimelineRow so lines align with the tick marks.
 *   - Hour boundary  → slightly thicker line (w-[1.5px])
 *   - 30-min mark    → thinner line (w-px), centred inside each hour cell
 */
export default function GridLines({ totalHours }: GridLinesProps) {
  const hours = Array.from({ length: totalHours }, (_, i) => i);

  return (
    <div
      className="absolute inset-0 grid pointer-events-none"
      style={{ gridTemplateColumns: `repeat(${totalHours}, 1fr)` }}
    >
      {hours.map((hour) => (
        <div key={hour} className="relative">
          {/* Hour line — aligned to the left edge of each cell */}
          <div className="absolute inset-y-0 left-0 w-[1.5px] bg-border/40" />

          {/* 30-min line — centred inside the cell */}
          <div className="absolute inset-y-0 left-1/2 w-px bg-border/25" />
        </div>
      ))}
    </div>
  );
}
