import { supabase } from "./supabaseClient";

export const deleteSet = async (setId: string) => {
  return await supabase.from("sets").delete().eq("id", setId);
};

export const deleteSetsByMatchId = async (matchId: string) => {
  return await supabase.from("sets").delete().eq("match_id", matchId);
};