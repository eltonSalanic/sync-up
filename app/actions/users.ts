"use server";

import { createClient } from "@/lib/supabase/server";
import { AnonUserSchema, CreateAnonUser } from "@/app/dtos/user.dto";
import { ActionResult } from "@/app/types/ActionResult";



export async function createAnonUser(formData: unknown): Promise<ActionResult<CreateAnonUser>> {
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

    console.log("User created successfully!", data);

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}