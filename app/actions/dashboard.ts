"use server";

import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { pinDto } from "../dtos/pin.dto";
import z from "zod";

export async function verifyDashboardPin(
  eventId: string,
  initialState,
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
