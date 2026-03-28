import { createClient } from "@/lib/supabase/client";
import { QueryData } from "@supabase/supabase-js";

const supabase = createClient();

const usersWithAvailabilityQuery = supabase
  .from("users")
  .select(
    `
      id,
      first_name,
      last_name,
      timeSlot:user_event_availability!inner(
        id,
        start_time,
        end_time
      )
    `,
  )
  .eq("user_event_availability.event_id", "");

export type UsersWithAvailability = QueryData<
  typeof usersWithAvailabilityQuery
>;

const eventSlotsQuery = supabase
  .from("event_days")
  .select("id, start_time, end_time")
  .eq("event_id", "");

export type EventSlots = QueryData<typeof eventSlotsQuery>;
