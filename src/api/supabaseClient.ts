import { createClient } from "@supabase/supabase-js";

// Lay bien moi truong
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

// Tao Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);
