"use client";

/*
  -- 5 Min Grids --
  12 grids per hour * 24 hours = 288 grids total
  5 Min Increments: 60min/5min = 12min/hour * 24 hours = 288 columns
*/

interface AvailabilityDisplayCalendarProps {
  startDate?: Date;
  endDate?: Date;
}

// Generate all 24 hour labels (0 → 23)
const HOURS = Array.from({ length: 24 }, (_, i) => i);

// Number of 5-min slots per hour
const SLOTS_PER_HOUR = 12;

// Total columns
const TOTAL_COLS = 24 * SLOTS_PER_HOUR; // 288

function formatHour(hour: number): string {
  if (hour === 0) return "12 AM";
  if (hour === 12) return "12 PM";
  return hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
}

export default function AvailabilityDisplayCalendar({
  startDate,
  endDate,
}: AvailabilityDisplayCalendarProps) {
  return (
    <div className="w-full overflow-x-auto">
      {/* ── Wrapper that sets the reference width ── */}
      <div className="min-w-[1200px]">

        {/* ── Availability Grid ── */}
        <div
          className="h-[250px] grid bg-muted rounded-t-md border border-b-0 border-border"
          style={{
            gridTemplateColumns: `repeat(${TOTAL_COLS}, 1fr)`,
          }}
        >
          {/* Hour divider lines inside the grid */}
          {HOURS.map((hour) => (
            <div
              key={`divider-${hour}`}
              className={`opacity-50 ${hour < 23 ? "border-r border-border" : ""}`}
              style={{
                gridColumn: `${hour * SLOTS_PER_HOUR + 1} / span ${SLOTS_PER_HOUR}`,
                gridRow: "1",
              }}
            />
          ))}
        </div>

        {/* ── Timeline Row ── */}
        <div className="relative h-8 border border-border rounded-b-md bg-card">
          {/*
            Each hour label sits at every (hour / 24 * 100)% of the width.
            We skip hour 0 (far left) to avoid clipping and position 12 AM
            at the very start edge.
          */}
          {HOURS.map((hour) => {
            const leftPercent = (hour / 24) * 100;
            return (
              <span
                key={`label-${hour}`}
                className="absolute top-1/2 -translate-y-1/2 select-none text-[0.625rem] font-medium text-muted-foreground whitespace-nowrap leading-none px-[2px]"
                style={{
                  left: `${leftPercent}%`,
                  // Center the label on its tick, except the first which is left-aligned
                  transform:
                    hour === 0
                      ? "translateY(-50%)"
                      : hour === 23
                        ? "translate(-100%, -50%)"
                        : "translate(-50%, -50%)",
                  fontFamily: "var(--font-accent)",   // Roboto Mono for tick labels
                }}
              >
                {formatHour(hour)}
              </span>
            );
          })}

          {/* Tick marks at every hour boundary */}
          {HOURS.map((hour) => {
            const leftPercent = (hour / 24) * 100;
            return (
              <div
                key={`tick-${hour}`}
                className="absolute top-0 w-[1px] h-[4px] bg-border"
                style={{
                  left: `${leftPercent}%`,
                }}
              />
            );
          })}

          {/* Half-hour sub-ticks */}
          {HOURS.map((hour) => {
            const leftPercent = ((hour + 0.5) / 24) * 100;
            return (
              <div
                key={`half-tick-${hour}`}
                className="absolute top-0 w-[1px] h-[3px] bg-border opacity-60"
                style={{
                  left: `${leftPercent}%`,
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
