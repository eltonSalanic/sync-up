"use server";

import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { ActionResult } from "../types/ActionResult";

export async function verifyDashboardPin(
  eventId: string,
  pin: string,
): Promise<ActionResult<void>> {
  const supabaseAdmin = createAdminClient();

  const { data: event, error } = await supabaseAdmin
    .from("events")
    .select("pin")
    .eq("id", eventId)
    .single();

  if (error || !event) {
    return { success: false, error: "Event not found" };
  }

  if (event.pin !== pin) {
    return { success: false, error: "Incorrect PIN" };
  }

  // Set cookie with pin for event
  const cookieStore = await cookies();
  cookieStore.set(`dashboard_access_${eventId}`, pin, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  return { success: true };
}
