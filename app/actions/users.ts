"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { AnonUserSchema } from "@/app/dtos/user.dto";
import { ActionResult } from "@/app/types/ActionResult";
import { Tables } from "@/database.types";

export async function createAnonUser(
  formData: unknown,
  eventId?: string
): Promise<ActionResult<Tables<"users">>> {
  // Validate input with Zod
  const validationResult = AnonUserSchema.safeParse(formData);

  if (!validationResult.success) {
    return {
      success: false,
      error: validationResult.error.issues[0].message,
    };
  }

  const anonUser = validationResult.data;

  try {
    const supabase = await createClient();

    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_SUPABASE_SECRET_KEY!
    );

    // 1. Create the anonymous Supabase Auth user
    const { data, error } = await supabase.auth.signInAnonymously({
      options: {
        data: {
          fName: anonUser.fName,
          lName: anonUser.lName,
          timezone: anonUser.timezone,
        },
      },
    });

    if (error || !data.user) {
      return {
        success: false,
        error: error?.message ?? "Failed to create user",
      };
    }

    const userId = data.user.id;
    console.log("--Anon user created successfully--", userId);

    // 2. Insert the user row directly — no trigger dependency, no race condition
    const { data: userRow, error: insertError } = await adminSupabase
      .from("users")
      .insert({
        id: userId,
        first_name: anonUser.fName,
        last_name: anonUser.lName,
        timezone: anonUser.timezone,
      })
      .select()
      .single();

    if (insertError || !userRow) {
      console.error("Failed to insert user row:", insertError?.message);
      return {
        success: false,
        error: "Account created but we couldn't set up your profile. Please try again.",
      };
    }

    // 3. If a guest joining an event, link them to it
    if (eventId) {
      const { error: eventUserError } = await supabase
        .from("event_users")
        .insert({ user_id: userId, event_id: eventId });

      if (eventUserError) {
        console.error("Failed to link user to event:", eventUserError.message);
        return {
          success: false,
          error: "Account created but we couldn't link you to the event. Please try again.",
        };
      }
    }

    return {
      success: true,
      data: userRow,
    };
  } catch (error) {
    console.log("Error creating anon user:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}