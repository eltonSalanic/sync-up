"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ActionResult } from "../types/ActionResult";
import { CreateEventSchema } from "../dtos/event.dto";
import { Tables } from "@/database.types";
import { localToUTC } from "@/lib/time";

/**
 * Creates a new event in the database. Should recieve date/times in users local time. This is currently the only
 * server action that performs conversions.
 *
 * @param {unknown} formData - The form data containing the event details.
 * @returns {Promise<ActionResult<Tables<"events">>>} - A promise resolving to an ActionResult containing the created event or an error message.
 */
export async function createEvent(
  formData: unknown,
): Promise<ActionResult<Tables<"events">>> {
  const supabaseAdmin = createAdminClient();

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

  // Fetch admin's IANA timezone so event slot times are stored as correct UTC
  const { data: userProfile } = await supabaseAdmin
    .from("users")
    .select("timezone")
    .eq("id", user.id)
    .single();

  const adminTimezone = userProfile?.timezone ?? "UTC";

  // 1. Insert the event
  const { data: newEvent, error: eventError } = await supabase
    .from("events")
    .insert({
      name: event.name,
      description: event.description,
      maxMembers: event.maxPeople,
      creator_user_id: user.id,
      pin: event.pin,
    })
    .select()
    .single();

  if (eventError) {
    return {
      success: false,
      error: eventError.message,
    };
  }

  // 2. Batch insert all event days, converting local → UTC using admin's timezone
  const days = event.availableDatesWithTimes.map((d) => ({
    event_id: newEvent.id,
    start_time: localToUTC(d.date, d.startTime, adminTimezone),
    end_time: localToUTC(d.date, d.endTime, adminTimezone),
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
