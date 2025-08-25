import type {
  CompletedMatch,
  CompletedMatchWithSets,
  CreateMatch,
  Match,
  MatchWithSets,
} from "../types/match";
import type { PlayerStub } from "../types/player";
import { supabase } from "./supabaseClient";

type MatchWithNames = Match & {
  player1: PlayerStub | null;
  player2: PlayerStub | null;
};

export async function getActiveMatches(): Promise<MatchWithNames[] | null> {
  const { data: matches } = await supabase
    .from("matches")
    .select("*")
    .eq("status", "ACTIVE");

  const ids = Array.from(
    new Set(
      matches
        ?.flatMap((m) => [m.player1_id, m.player2_id, m.winner_id])
        .filter(Boolean)
    )
  );

  const { data: players } = await supabase
    .from("players")
    .select("id, name")
    .in("id", ids);

  const nameById = new Map(players?.map((p) => [p.id, p.name]));
  const withNames = matches?.map((m) => ({
    ...m,
    player1: { id: m.player1_id, name: nameById.get(m.player1_id) ?? null },
    player2: { id: m.player2_id, name: nameById.get(m.player2_id) ?? null },
    winner: m.winner_id
      ? { id: m.winner_id, name: nameById.get(m.winner_id) ?? null }
      : null,
  }));

  return (withNames as MatchWithNames[]) ?? [];
}

export async function getMatchById(id: string): Promise<MatchWithSets> {
  const { data, error } = await supabase
    .from("matches")
    .select("*, sets(*)")
    .eq("id", id)
    .single();

  if (error) throw error;

  return data;
}

export const updateSetNumber = async (
  sets: number,
  matchId: string
): Promise<void> => {
  const { error } = await supabase
    .from("matches")
    .upsert({ id: matchId, best_of_sets: sets });

  if (error) throw error;
};

export const createMatchWithSets = async (matchData: CreateMatch) => {
  const { data: match, error: matchErr } = await supabase
    .from("matches")
    .insert(matchData)
    .select()
    .single();

  if (matchErr) throw matchErr;

  const setsPayload = Array.from(
    { length: matchData.best_of_sets },
    (_, i) => ({
      match_id: match.id,
      set_number: i + 1,
      player1_id: matchData.player1_id,
      player2_id: matchData.player2_id,
      player1_score: 0,
      player2_score: 0,
      winner_id: null,
    })
  );

  const { data: sets, error: setsErr } = await supabase
    .from("sets")
    .insert(setsPayload)
    .select();

  if (setsErr) throw setsErr;

  return { match, sets };
};

export const saveMatch = async (match: MatchWithSets) => {
  // uppdatera alla set (poäng + vinnare)
  const setUpdates = match.sets.map((s) => ({
    id: s.id,
    match_id: match.id,
    player1_id: s.player1_id,
    player2_id: s.player2_id,
    player1_score: s.player1_score,
    player2_score: s.player2_score,
    winner_id: s.winner_id,
    set_number: s.set_number,
  }));

  if (setUpdates.length) {
    const { error: setsErr } = await supabase
      .from("sets")
      .upsert(setUpdates, { onConflict: "id" });
    if (setsErr) throw setsErr;
  }

  const { data, error } = await supabase
    .from("matches")
    .update({
      id: match.id,
      status: match.status,
      player1_id: match.player1_id,
      player1_score: match.player1_score,
      player2_id: match.player2_id,
      player2_score: match.player2_score,
      winner_id: match.winner_id,
      best_of_sets: match.best_of_sets,
    })
    .eq("id", match.id)
    .select()
    .single();

  if (error) throw error;
  return data!;
};

export async function getCompletedMatchById(
  matchId: string
): Promise<CompletedMatchWithSets | null> {
  if (!matchId) throw new Error("matchId saknas");

  const { data: match, error: matchError } = await supabase
    .from("matches")
    .select("*, sets(*)")
    .eq("id", matchId)
    .eq("status", "COMPLETED")
    .maybeSingle();

  if (matchError) throw matchError;
  if (!match) return null;

  const ids = Array.from(
    new Set(
      [match.player1_id, match.player2_id, match.winner_id].filter(
        Boolean
      ) as string[]
    )
  );

  let nameById = new Map<string, string>();
  if (ids.length) {
    const { data: players, error: playersError } = await supabase
      .from("players")
      .select("id, name")
      .in("id", ids);

    if (playersError) throw playersError;
    nameById = new Map(players.map((p) => [p.id, p.name]));
  }

  const withNames: CompletedMatchWithSets = {
    ...match,
    player1: {
      id: match.player1_id,
      name: nameById.get(match.player1_id) ?? null,
    },
    player2: {
      id: match.player2_id,
      name: nameById.get(match.player2_id) ?? null,
    },
    winner: match.winner_id
      ? { id: match.winner_id, name: nameById.get(match.winner_id) ?? null }
      : null,
  };

  return withNames;
}

// With pagination
export async function getCompletedMatchesPage(
  page: number,
  pageSize: number
): Promise<{ data: CompletedMatch[]; total: number }> {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const {
    data: rows,
    error,
    count,
  } = await supabase
    .from("matches")
    .select(
      `
        id,
        player1_id,
        player2_id,
        winner_id,
        best_of_sets,
        status,
        player1_score,
        player2_score,
        created_at
      `,
      { count: "exact" }
    )
    .eq("status", "COMPLETED")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw error;

  const matches = rows ?? [];

  const playerIds = Array.from(
    new Set(
      matches
        .flatMap((m) => [m.player1_id, m.player2_id, m.winner_id])
        .filter((x): x is string => typeof x === "string" && x.length > 0)
    )
  );

  let playersById = new Map<string, PlayerStub>();
  if (playerIds.length > 0) {
    const { data: players, error: pErr } = await supabase
      .from("players")
      .select("id, name")
      .in("id", playerIds);

    if (pErr) throw pErr;

    playersById = new Map(
      (players ?? []).map((p) => [p.id, { id: p.id, name: p.name }])
    );
  }

  const completed: CompletedMatch[] = matches.map((m) => ({
    ...m,
    player1: playersById.get(m.player1_id) ?? null,
    player2: playersById.get(m.player2_id) ?? null,
    winner: m.winner_id ? playersById.get(m.winner_id) ?? null : null,
  }));

  return { data: completed ?? [], total: count ?? 0 };
}

export const deleteMatch = async (matchId: string): Promise<any> => {
  try {
    const setResponse = await supabase
      .from("sets")
      .delete()
      .eq("match_id", matchId);

    if (setResponse.status === 204 || setResponse.status === 200) {
      return await supabase.from("matches").delete().eq("id", matchId);
    } else {
      console.error(setResponse.error);

      return;
    }
  } catch (error) {
    console.error("ERROR: ", error);
  }
};

export const getActiveMatchesIdByPlayerId = async (playerId: string) => {
  const { data, error } =
    (await supabase
      .from("matches")
      .select("id")
      .eq("status", "ACTIVE")
      .or(`player1_id.eq.${playerId},player2_id.eq.${playerId}`)) ?? [];

  if (!error) {
    return data;
  } else {
    console.error(error);
  }
};

export const deleteActiveMatchesByPlayerId = async (
  playerId: string
): Promise<number> => {
  try {
    const res = await getActiveMatchesIdByPlayerId(playerId);

    if (res) {
      const response = await supabase
        .from("matches")
        .delete()
        .eq("status", "ACTIVE")
        .or(`player1_id.eq.${playerId},player2_id.eq.${playerId}`);

      return response.status;
    }
    return 0;
  } catch (error) {
    console.error("ERROR: ", error);
    return 0;
  }
};
