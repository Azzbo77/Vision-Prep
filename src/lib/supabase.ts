import { createClient } from "@supabase/supabase-js";

// Browser client — used in client components and server actions
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);