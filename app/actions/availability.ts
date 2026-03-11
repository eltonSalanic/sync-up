"use server";

import { createClient } from "@/lib/supabase/server";
import { ActionResult } from "@/app/types/ActionResult";
import { redirect } from "next/navigation";

export interface AvailabilitySlot {
  eventDayId: number;
  startTime: string; // ISO string
  endTime: string;   // ISO string
}

export async function submitAvailability(
  eventId: string,
  slots: AvailabilitySlot[]
): Promise<ActionResult<void>> {
  if (!slots.length) {
    return { success: false, error: "Please select at least one time slot." };
  }

  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: "You must be signed in to submit availability." };
  }

  const rows = slots.map((slot) => ({
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

  // TODO: Redirect to a dedicated "you're all set" confirmation page once built
  redirect("/");
}
