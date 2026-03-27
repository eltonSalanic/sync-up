"use client";

import { UsersWithAvailability } from "./types";
import { getHours } from "date-fns";

/*
  -- 5 Min Grids --
  12 grids per hour * 24 hours = 288 grids total
  5 Min Increments: 60min/5min = 12min/hour * 24 hours = 288 columns
*/

interface AvailabilityDisplayCalendarProps {
  usersWithAvailability: UsersWithAvailability
}

// Generate all 24 hour labels (0 → 23)
const HOURS = Array.from({ length: 24 }, (_, i) => i);

// Number of 5-min slots per hour. If you change: 60/min increment
const SLOTS_PER_HOUR = 12;

// Total columns
const TOTAL_COLS = 24 * SLOTS_PER_HOUR; // 288

function formatHour(hour: number): string {
  if (hour === 0) return "12 AM";
  if (hour === 12) return "12 PM";
  return hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
}

export default function AvailabilityDisplayCalendar({
  usersWithAvailability
}: AvailabilityDisplayCalendarProps) {
  const firstUser = usersWithAvailability[0];
  const timeSlot = firstUser.timeSlot[0];
  /* TODO: Remove this console log */
  console.log('User Time Slot:', timeSlot);
  console.log('Start hour from date-fns: ', getHours(new Date(timeSlot.start_time)));
  console.log('Start hour from js', new Date(timeSlot.start_time).getHours() * 12 + 1);
  console.log('Minutes: ', new Date(timeSlot.end_time).getMinutes());
  return (
    /* Wrapper that sets the containers width */
    <div className="w-full overflow-x-auto">
      {/* Sets the width of the timeline. Width determines width of time grid */}
      <div className="min-w-[2200px]">
        {/* Scrollable Timeline Grid */}
        <div
          className="h-[250px] grid bg-muted rounded-t-md border border-b-0 border-border"
          style={{
            gridTemplateColumns: `repeat(${TOTAL_COLS}, 1fr)`,
          }}
        >
          {/* Start Col = (Hour * 12 + 1) + (min / 5) round up in case minutes are not divisible by 5 */}
          {/* End Col = (Hour * 12 + 1) + (min / 5 )round up in case minutes are not divisible by 5 */}
          <div 
            className="bg-red-500 rounded-md"
            style={{
              gridRow: 1, // Ensures the block perfectly aligns on the single grid row
              gridColumnStart: (new Date(timeSlot.start_time).getHours() * SLOTS_PER_HOUR + 1) + (new Date(timeSlot.start_time).getMinutes() % 5),
              gridColumnEnd: (new Date(timeSlot.end_time).getHours() * SLOTS_PER_HOUR + 1) + (new Date(timeSlot.end_time).getMinutes())
            }}
          >
          </div>
          {/* Hour divider lines inside the grid */}
          {/*HOURS.map((hour) => (
            <div
              key={`divider-${hour}`}
              // Border on the right, except last hour
              className={`opacity-50 ${hour < 23 ? "border-r border-border" : ""}`}
              style={{
                gridColumn: `${hour * SLOTS_PER_HOUR + 1} / span ${SLOTS_PER_HOUR}`,
                gridRow: "1",
              }}
            />
          ))*/}
        </div>

        {/* Times Row (24-column grid) */}
        <div
          className="h-8 grid border border-border rounded-b-md bg-card"
          style={{ gridTemplateColumns: "repeat(24, 1fr)" }}
        >
          {HOURS.map((hour) => (
            <div key={`time-cell-${hour}`} className="relative border-l border-transparent">
              {/* Hour Label - centered on the left edge of its cell */}
              <span
                className="absolute top-1/2 left-0 select-none text-[0.625rem] font-medium text-muted-foreground whitespace-nowrap leading-none px-[2px]"
                style={{
                  // Align the first item to the left, center all others exactly over the grid line
                  transform: hour === 0 ? "translate(0%, -50%)" : "translate(-50%, -50%)",
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
      </div>
    </div>
  );
}
