"use server";

import { cookies } from "next/headers";
import { refresh } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { pinDto } from "../dtos/pin.dto";
import { ActionResult } from "../types/ActionResult";
import z from "zod";

export async function verifyDashboardPin(
  eventId: string,
  _prevState: unknown,
  formData: FormData,
) {
  const supabaseAdmin = createAdminClient();

  const {
    data,
    success,
    error: zodError,
  } = pinDto.safeParse({
    pin: formData.get("pin"),
    eventId: eventId,
  });

  if (!success) {
    const errorTree = z.flattenError(zodError);
    return { success: false, error: errorTree.fieldErrors };
  }

  const { pin: enteredPin } = data;

  const { data: event, error } = await supabaseAdmin
    .from("events")
    .select("pin")
    .eq("id", eventId)
    .single();

  if (error || !event) {
    return { success: false, error: { eventId: ["Event not found"] } };
  }

  if (event.pin !== enteredPin) {
    return { success: false, error: { pin: ["Incorrect PIN"] } };
  }

  // Set cookie with pin for event
  const cookieStore = await cookies();
  cookieStore.set(`dashboard_access_${eventId}`, enteredPin, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  return { success: true };
}

export async function removeUserFromEvent(
  eventId: string,
  eventUserId: string,
  _prevState: ActionResult<void>,
  _formData: FormData,
): Promise<ActionResult<void>> {
  const supabaseAdmin = createAdminClient();

  // Verify the caller has dashboard access via the PIN cookie
  const cookieStore = await cookies();
  const cookiePin = cookieStore.get(`dashboard_access_${eventId}`)?.value;

  if (!cookiePin) {
    return { success: false, error: "Unauthorized" };
  }

  const { data: event } = await supabaseAdmin
    .from("events")
    .select("pin")
    .eq("id", eventId)
    .single();

  if (!event || event.pin !== cookiePin) {
    return { success: false, error: "Unauthorized" };
  }

  // Fetch user_id to confirm membership before deleting
  const { data: eventUser } = await supabaseAdmin
    .from("event_users")
    .select("user_id")
    .eq("id", eventUserId)
    .eq("event_id", eventId)
    .single();

  if (!eventUser) {
    return { success: false, error: "User not found in this event" };
  }

  // Deleting the user cascades to event_users and user_event_availability thru supabase
  const { error } = await supabaseAdmin
    .from("users")
    .delete()
    .eq("id", eventUser.user_id);

  if (error) {
    return { success: false, error: error.message };
  }

  refresh();
  return { success: true, data: undefined };
}
