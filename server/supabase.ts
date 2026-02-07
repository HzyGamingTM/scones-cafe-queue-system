import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_API_URL!;
const supabaseKey = process.env.SUPABASE_API_KEY!;
const supabaseSecretKey = process.env.SUPABASE_SECRET_API_KEY!;

export const supabaseCli = createClient(supabaseUrl, supabaseKey);
export const privilegedSupabaseCli = createClient(supabaseUrl, supabaseSecretKey);