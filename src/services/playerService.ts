import type { PostgrestSingleResponse } from "@supabase/supabase-js";
import type { Player, PlayerStub } from "../types/player";
import { supabase } from "./supabaseClient";
import { deleteActiveMatchesByPlayerId } from "./matchService";

export const getAllActivePlayers = async (): Promise<
  PostgrestSingleResponse<Player[]>
> => {
  return (
    (await supabase.from("players").select("*").is("deleted_at", null)) ?? []
  );
};

export const getAllPlayers = async (): Promise<
  PostgrestSingleResponse<Player[]>
> => {
  return (await supabase.from("players").select("*")) ?? [];
};

export const getPlayerNamesByIds = async (
  ids: string[]
): Promise<PlayerStub[]> => {
  const unique = Array.from(new Set(ids.filter(Boolean)));
  if (unique.length === 0) return [];

  const { data, error } = await supabase
    .from("players")
    .select("id, name")
    .in("id", unique);

  if (error) throw error;

  // Bevara samma ordning som i 'ids'
  const byId = new Map((data ?? []).map((p) => [p.id, p]));

  return (
    ids.map((id) => byId.get(id)).filter((p): p is PlayerStub => Boolean(p)) ??
    []
  );
};

type playerNamesAndId = {
  id: string;
  name: string;
};

export const getPlayerNamesByMatchId = async (
  matchId: string
): Promise<playerNamesAndId[]> => {
  const { data, error } = await supabase
    .from("players")
    .select("id, name")
    .eq("match_id", matchId);

  if (error) throw error;

  return data ?? [];
};

export const createUpToTwoPlayers = async (newPlayers: string[]) => {
  // 1) Städa & dedupe (case-insensitivt)
  const cleaned = newPlayers
    .map((n) => n?.trim())
    .filter((n): n is string => Boolean(n));

  const dedup = new Map<string, string>();

  for (const n of cleaned) {
    const key = n.toLocaleLowerCase("sv-SE");
    if (!dedup.has(key)) dedup.set(key, n);
  }

  const rows = Array.from(dedup.values())
    .slice(0, 2)
    .map((name) => ({ name }));

  if (rows.length === 0) return [];

  // 2) Skapa (eller ignorera om redan finns)
  const { data, error } = await supabase.from("players").upsert(rows).select();

  if (error) throw error;

  return data ?? [];
};

export const softDeletePlayer = async (playerId: string) => {
  const { error } = await supabase
    .from("players")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", playerId)
    .select();

  if (!error) {
    await deleteActiveMatchesByPlayerId(playerId);
  }
};

// Resets player statistics and removes all matches and set
export const resetAllPlayers = async () => {
  const { data, error } = await supabase.rpc("reset_pingis_data");

  if (error) throw new Error(error.message);

  return data as {
    matches_deleted: number;
    sets_deleted: number;
    players_reset: number;
  };
};

// Remove all players, matches and sets
export const removeAll = async () => {
  const { data, error } = await supabase.rpc("purge_pingis_all");

  if (error) throw new Error(error.message);

  return data as {
    players_deleted: number;
    matches_deleted: number;
    sets_deleted: number;
  };
};
