import { createClient } from "@supabase/supabase-js";
import { Config } from "@/lib/config";

export const supabaseAdmin = createClient(
    Config.SUPABASE_URL,
    Config.SUPABASE_SERVICE_ROLE_KEY,
);
