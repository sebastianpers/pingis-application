import type { PostgrestSingleResponse } from "@supabase/supabase-js";
import type { Player, PlayerStub } from "../types/player";
import { supabase } from "./supabaseClient";
import { deleteActiveMatchesByPlayerId } from "./matchService";
import type { PlayerInfo } from "../components/AddDynamicInputFields";

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
    .select("id, username")
    .in("id", unique);

  if (error) throw error;

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

export const createPlayers = async (newPlayers: PlayerInfo[]) => {
  const players = newPlayers.map((n) => {
    n.firstName = n.firstName.trim();
    n.lastName = n.lastName.trim();
    n.username = n.username.replace(/\s+/g, "").trim();

    return n;
  });

  if (players.length === 0) return [];

  const { data, error } = await supabase
    .from("players")
    .upsert(players)
    .select();

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
