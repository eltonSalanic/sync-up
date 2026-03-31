import { format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DayNavigationProps {
  activeDay: string; // "YYYY-MM-DD"
  activeDayIndex: number;
  totalDays: number;
  onPrev: () => void;
  onNext: () => void;
}

export default function DayNavigation({
  activeDay,
  activeDayIndex,
  totalDays,
  onPrev,
  onNext,
}: DayNavigationProps) {
  return (
    <div className="flex items-center justify-between px-1 pt-2">
      <button
        className="inline-flex items-center justify-center rounded-md p-1.5 transition-colors hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
        onClick={onPrev}
        disabled={activeDayIndex === 0}
        aria-label="Previous day"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <span className="text-sm font-semibold font-main text-foreground">
        {format(new Date(activeDay + "T00:00:00"), "EEEE, MMMM d, yyyy")}
      </span>

      <button
        className="inline-flex items-center justify-center rounded-md p-1.5 transition-colors hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
        onClick={onNext}
        disabled={activeDayIndex === totalDays - 1}
        aria-label="Next day"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
