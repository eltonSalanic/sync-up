import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/database.types";

export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_SUPABASE_SECRET_KEY!,
  );
}
