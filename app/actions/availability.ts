"use server";

import { createClient } from "@/lib/supabase/server";
import { ActionResult } from "@/app/types/ActionResult";
import { redirect } from "next/navigation";
import { z } from "zod";
import { TablesInsert } from "@/database.types";
import { AvailabilitySlotSchema } from "@/app/dtos/event.dto";

const SubmitAvailabilitySchema = z.array(AvailabilitySlotSchema);

export async function submitAvailability(
  eventId: string,
  rawSlots: unknown
): Promise<ActionResult<void>> {
  // Zod validation
  const validationResult = SubmitAvailabilitySchema.safeParse(rawSlots);
  if (!validationResult.success) {
    return { success: false, error: "Invalid availability data submitted." };
  }
  
  // Ensure at least one time slot is selected
  const slots = validationResult.data;
  if (!slots.length) {
    return { success: false, error: "Please select at least one time slot." };
  }

  // Ensure anon user is authenticated
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: "You must be signed in to submit availability." };
  }

  // Map the validated DTO payload to the strict Supabase insert type
  const rows: TablesInsert<"user_event_availability">[] = slots.map((slot) => ({
    user_id: user.id,
    event_id: eventId,
    start_time: slot.startTime,
    end_time: slot.endTime,
  }));

  const { error } = await supabase
    .from("user_event_availability")
    .insert(rows);

  if (error) {
    console.error("Failed to insert availability:", error.message);
    return { success: false, error: "Failed to save your availability. Please try again." };
  }

  return { success: true, data: undefined };
}
