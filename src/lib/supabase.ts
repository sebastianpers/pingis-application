import { createClient } from "@supabase/supabase-js";

// Vite läser variabler som börjar med VITE_
// OBS: dessa blir offentliga i bundlen (det är ok för anon-key).
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  // Rekommenderade options kan sättas här (t.ex. persistensstrategi för auth)
});
