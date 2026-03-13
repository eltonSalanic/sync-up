export interface EventDay {
  id: number;
  start_time: string; // ISO UTC
  end_time: string; // ISO UTC
}

export interface AvailabilityFormProps {
  eventId: string;
  eventName: string;
  eventDays: EventDay[];
  /** Guest's IANA timezone e.g. "America/New_York" */
  userTimezone: string;
}

// Days for Schedule-X
export interface DaySlot {
  startTime: string;
  endTime: string;
}
