import { EventSlots } from "../types";
import { toCol } from "./utils";
import GridLines from "./GridLines";

interface EventSlotsRowProps {
  activeDayEventSlots: EventSlots;
  totalCols: number;
  totalHours: number;
  activeMidnight: number;
}

export default function EventSlotsRow({
  activeDayEventSlots,
  totalCols,
  totalHours,
  activeMidnight,
}: EventSlotsRowProps) {
  return (
    // Event's Time Slots Row
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

      {/* Hour and 30-min guide lines */}
      <GridLines totalHours={totalHours} />

      {/* Event slot bars */}
      <div
        className="absolute inset-0 grid"
        style={{ gridTemplateColumns: `repeat(${totalCols}, 1fr)` }}
      >
        {activeDayEventSlots.map((slot) => (
          <div
            key={slot.id}
            className="bg-primary/30 border-l border-primary"
            style={{
              gridColumnStart: toCol(slot.start_time, activeMidnight),
              gridColumnEnd: toCol(slot.end_time, activeMidnight),
              gridRow: 1,
            }}
          />
        ))}
      </div>
    </div>
  );
}
