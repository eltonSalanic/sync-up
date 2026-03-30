"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { EventSlots, UsersWithAvailability } from "./types";

interface ConsensusWindowProps {
  eventSlots: EventSlots;
  usersWithAvailability: UsersWithAvailability;
}

interface ConsensusWindow {
  start: Date;
  end: Date;
  durationMins: number;
}

/**
 * Scans all event slots in 5-min cells and returns continuous windows
 * where ALL active users are simultaneously free for at least minDurationMins.
 *
 * Active users = anyone who submitted at least one availability slot.
 * If a user has no slots for a particular event slot's day, they will
 * block consensus on that slot (they never indicated they were free).
 */
function findConsensusWindows(
  eventSlots: EventSlots,
  allUsers: UsersWithAvailability,
  minDurationMins: number,
): ConsensusWindow[] {
  // Only users who submitted at least one availability slot
  const activeUsers = allUsers.filter((u) => u.timeSlot.length > 0);
  if (activeUsers.length === 0) return [];

  const results: ConsensusWindow[] = [];
  const stepMs = 5 * 60 * 1000; // 5 minutes in ms
  const minDurationMs = minDurationMins * 60 * 1000;

  for (const eventSlot of eventSlots) {
    const eventStartMs = new Date(eventSlot.start_time).getTime();
    const eventEndMs = new Date(eventSlot.end_time).getTime();

    // Track the start of the current "all-free" run; null means no run in progress
    let runStart: number | null = null;

    for (let t = eventStartMs; t < eventEndMs; t += stepMs) {
      const cellEnd = t + stepMs;

      // A cell is "free" if every active user has at least one slot covering it fully
      const allFree = activeUsers.every((user) =>
        user.timeSlot.some((slot) => {
          const s = new Date(slot.start_time).getTime();
          const e = new Date(slot.end_time).getTime();
          return s <= t && e >= cellEnd;
        }),
      );

      if (allFree) {
        // Start a new run if one isn't already in progress
        if (runStart === null) runStart = t;
      } else {
        // Run just ended — emit if long enough
        if (runStart !== null) {
          const durationMs = t - runStart;
          if (durationMs >= minDurationMs) {
            results.push({
              start: new Date(runStart),
              end: new Date(t),
              durationMins: durationMs / (60 * 1000),
            });
          }
          runStart = null;
        }
      }
    }

    // Handle a run that extends all the way to the end of the event slot
    if (runStart !== null) {
      const durationMs = eventEndMs - runStart;
      if (durationMs >= minDurationMs) {
        results.push({
          start: new Date(runStart),
          end: new Date(eventEndMs),
          durationMins: durationMs / (60 * 1000),
        });
      }
    }
  }

  return results;
}

/** Computes the duration of a slot in minutes */
function slotDurationMins(slot: EventSlots[number]): number {
  return (
    (new Date(slot.end_time).getTime() - new Date(slot.start_time).getTime()) /
    (60 * 1000)
  );
}

export default function ConsensusWindowPanel({
  eventSlots,
  usersWithAvailability,
}: ConsensusWindowProps) {
  // Derive slider bounds from event slot durations
  const { defaultDuration, maxDuration } = useMemo(() => {
    if (eventSlots.length === 0) return { defaultDuration: 30, maxDuration: 60 };

    const durations = eventSlots.map(slotDurationMins);
    const smallest = Math.min(...durations);
    const largest = Math.max(...durations);

    return {
      // Default = smallest event slot duration, rounded to nearest 10
      defaultDuration: Math.max(10, Math.round(smallest / 10) * 10),
      // Max = largest event slot duration, floored to 10-min step
      maxDuration: Math.max(10, Math.floor(largest / 10) * 10),
    };
  }, [eventSlots]);

  const [minDuration, setMinDuration] = useState(defaultDuration);

  const consensusWindows = useMemo(
    () => findConsensusWindows(eventSlots, usersWithAvailability, minDuration),
    [eventSlots, usersWithAvailability, minDuration],
  );

  if (eventSlots.length === 0) return null;

  return (
    <div className="space-y-4 rounded-lg border border-border bg-card p-4">
      {/* Header */}
      <div className="space-y-0.5">
        <h3 className="text-sm font-semibold font-main text-foreground">
          Overlapping Availability
        </h3>
        <p className="text-xs text-muted-foreground font-main">
          Windows where everyone who responded is free simultaneously
        </p>
      </div>

      {/* Slider */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground font-main">
            Minimum duration
          </span>
          <span className="text-xs font-semibold font-main text-foreground tabular-nums">
            {minDuration} min
          </span>
        </div>
        <input
          type="range"
          min={10}
          max={maxDuration}
          step={10}
          value={minDuration}
          onChange={(e) => setMinDuration(Number(e.target.value))}
          className="w-full accent-primary cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-muted-foreground font-main">
          <span>10 min</span>
          <span>{maxDuration} min</span>
        </div>
      </div>

      {/* Results */}
      {consensusWindows.length === 0 ? (
        <p className="text-sm text-muted-foreground font-main py-1">
          No windows found where everyone is free for {minDuration} min.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {consensusWindows.map((window, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-md border border-primary/40 bg-primary/10 px-4 py-2.5"
            >
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
          ))}
        </div>
      )}
    </div>
  );
}
