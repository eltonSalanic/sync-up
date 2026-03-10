"use server";

import { createClient } from "@/lib/supabase/server";
import { ActionResult } from "../types/ActionResult";
import { CreateEventSchema } from "../dtos/event.dto";
import { Tables } from "@/database.types";

/** Combines a Date and an "HH:MM" string into a full ISO 8601 timestamp */
function toISO(date: Date, time: string): string {
  const [hours, minutes] = time.split(":");
  const dt = new Date(date);
  dt.setHours(Number(hours), Number(minutes), 0, 0);
  return dt.toISOString();
}

export async function createEvent(
  formData: unknown
): Promise<ActionResult<Tables<"events">>> {
  const validationResult = CreateEventSchema.safeParse(formData);

  if (!validationResult.success) {
    return {
      success: false,
      error: validationResult.error.issues[0].message,
    };
  }

  const event = validationResult.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: "User not found or not logged in",
    };
  }

  // 1. Insert the event
  const { data: newEvent, error: eventError } = await supabase
    .from("events")
    .insert({
      name: event.name,
      description: event.description,
      maxMembers: event.maxPeople,
      creator_user_id: user.id,
    })
    .select()
    .single();

  if (eventError) {
    return {
      success: false,
      error: eventError.message,
    };
  }

  // 2. Batch insert all event days
  const days = event.availableDatesWithTimes.map((d) => ({
    event_id: newEvent.id,
    start_time: toISO(d.date, d.startTime),
    end_time: toISO(d.date, d.endTime),
  }));

  const { error: daysError } = await supabase.from("event_days").insert(days);

  if (daysError) {
    // Cleanup orphaned event row
    await supabase.from("events").delete().eq("id", newEvent.id);
    return {
      success: false,
      error: daysError.message,
    };
  }

  return {
    success: true,
    data: newEvent,
  };
}
