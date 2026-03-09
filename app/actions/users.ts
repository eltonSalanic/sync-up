"use server";

import { createClient } from "@/lib/supabase/server";
import { AnonUserSchema, CreateAnonUser } from "@/app/dtos/user.dto";
import { ActionResult } from "@/app/types/ActionResult";
import { Database, Tables } from "@/database.types";



export async function createAnonUser(formData: unknown): Promise<ActionResult<Tables<"users">>> {
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
    const { data, error } = await supabase.auth.signInAnonymously({
      options: {
        data: {
          fName: anonUser.fName,
          lName: anonUser.lName,
          timezone: anonUser.timezone,
        },
      },
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    console.log("--User created successfully--", data.user);

    return {
      success: true,
      // Returning user in case it's needed in the future
      data: {
        id: data.user?.id || "No User ID Returned By Supabase",
        first_name: data.user?.user_metadata.fName,
        last_name: data.user?.user_metadata.lName,
        timezone: data.user?.user_metadata.timezone,
        created_at: data.user?.created_at || "",
      }
    };
  } catch (error) {
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}