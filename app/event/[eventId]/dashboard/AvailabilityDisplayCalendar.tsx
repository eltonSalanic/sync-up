"use client";

import { UsersWithAvailability, EventSlots } from "./types";
import { getHours } from "date-fns";

/*
  -- 5 Min Grids --
  12 grids per hour * 24 hours = 288 grids total
  5 Min Increments: 60min/5min = 12min/hour * 24 hours = 288 columns
*/

interface AvailabilityDisplayCalendarProps {
  usersWithAvailability: UsersWithAvailability;
  eventSlots: EventSlots;
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
  usersWithAvailability,
  eventSlots,
}: AvailabilityDisplayCalendarProps) {
  const firstUser = usersWithAvailability[1];
  const timeSlots = firstUser.timeSlot;
  /* TODO: Remove this console log */
  console.log("Individual Local Times");
  timeSlots.forEach((slot, i) => {
    console.log(
      `Slot ${i}: `,
      new Date(slot.start_time).getHours() +
        ":" +
        new Date(slot.start_time).getMinutes(),
      new Date(slot.end_time).getHours() +
        ":" +
        new Date(slot.end_time).getMinutes(),
    );
  });
  return (
    /* Wrapper: overflow-x-auto enables horizontal scrolling */
    <div className="w-full overflow-x-auto">
      {/* Inner container: min-width forces the timeline to be scrollable */}
      <div className="min-w-[2200px]">
        {/* ── Event's Time Slots Row ── */}
        <div
          className="relative border border-b-0 border-border bg-card"
          style={{ height: "50px" }}
        >
          {/* TODO: Split this into its own component */}
          {/* Sticky "Event" label */}
          <div className="sticky left-0 z-10 w-0 h-full flex items-start pt-2 pl-2 pointer-events-none">
            <span className="pointer-events-auto inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold font-main bg-background/80 backdrop-blur-sm border border-border shadow-sm text-muted-foreground whitespace-nowrap select-none">
              Event
            </span>
          </div>

          {/* Event slot bars */}
          <div
            className="absolute inset-0 grid"
            style={{ gridTemplateColumns: `repeat(${TOTAL_COLS}, 1fr)` }}
          >
            {eventSlots.map((slot) => (
              <div
                key={slot.id}
                className="bg-primary/30 border-l border-primary"
                style={{
                  gridColumnStart:
                    new Date(slot.start_time).getHours() * SLOTS_PER_HOUR +
                    1 +
                    new Date(slot.start_time).getMinutes() / 5,
                  gridColumnEnd:
                    new Date(slot.end_time).getHours() * SLOTS_PER_HOUR +
                    1 +
                    new Date(slot.end_time).getMinutes() / 5,
                  gridRow: 1,
                }}
              />
            ))}
          </div>
        </div>

        {/* ── User rows ── */}
        {usersWithAvailability.map((user, i) => (
          <div
            key={user.id}
            className="relative border border-b-0 border-border bg-muted"
            style={{ height: "150px" }}
          >
            {/* TODO: Use only span */}
            {/* Sticky name badge — stays pinned to the left edge while scrolling */}
            <div className="sticky left-0 z-10 w-0 h-full flex items-start pt-2 pl-2 pointer-events-none">
              <span className="pointer-events-auto inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold font-main bg-background/80 backdrop-blur-sm border border-border shadow-sm text-foreground whitespace-nowrap select-none">
                {user.first_name} {user.last_name}
              </span>
            </div>

            {/* Availability slots on grid for this user */}
            <div
              className="absolute inset-0 grid"
              style={{
                gridTemplateColumns: `repeat(${TOTAL_COLS}, 1fr)`,
              }}
            >
              {user.timeSlot.map((slot) => (
                <div
                  className="bg-red-500"
                  key={slot.id}
                  style={{
                    gridColumnStart:
                      new Date(slot.start_time).getHours() * SLOTS_PER_HOUR +
                      1 +
                      new Date(slot.start_time).getMinutes() / 5,
                    gridColumnEnd:
                      new Date(slot.end_time).getHours() * SLOTS_PER_HOUR +
                      1 +
                      new Date(slot.end_time).getMinutes() / 5,
                    gridRow: 1,
                  }}
                />
              ))}
            </div>
          </div>
        ))}

        {/* Closing border for the last row */}
        <div className="border-b border-l border-r border-border rounded-b-none" />

        {/* Times Row (24-column grid) */}
        <div
          className="h-8 grid border border-border rounded-b-md bg-card"
          style={{ gridTemplateColumns: "repeat(24, 1fr)" }}
        >
          {HOURS.map((hour) => (
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
                    hour === 0
                      ? "translate(0%, -50%)"
                      : "translate(-50%, -50%)",
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
