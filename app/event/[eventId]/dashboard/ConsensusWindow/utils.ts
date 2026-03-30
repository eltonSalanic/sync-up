import { EventSlots, UsersWithAvailability } from "../types";

export interface ConsensusWindow {
  start: Date;
  end: Date;
  durationMins: number;
}

/** Computes the duration of a slot in minutes */
export function slotDurationMins(slot: EventSlots[number]): number {
  return (
    (new Date(slot.end_time).getTime() - new Date(slot.start_time).getTime()) /
    (60 * 1000)
  );
}

/**
 * Scans all event slots in 5-min cells and returns continuous windows
 * where ALL active users are simultaneously free for at least minDurationMins.
 *
 * Active users = anyone who submitted at least one availability slot.
 * If a user has no slots for a particular event slot's day, they will
 * block consensus on that slot (they never indicated they were free).
 */
export function findConsensusWindows(
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
