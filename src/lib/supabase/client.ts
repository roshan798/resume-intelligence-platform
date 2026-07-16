import { createClient } from "@supabase/supabase-js";
import { Config } from "@/lib/config";

export const supabaseClient = createClient(
    Config.SUPABASE_URL,
    Config.SUPABASE_ANON_KEY,
);
