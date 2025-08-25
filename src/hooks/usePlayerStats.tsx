// src/hooks/usePlayerStats.ts
import { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import type { PlayerStats } from "../types/playerStats";

export function usePlayerStats() {
  const [data, setData] = useState<PlayerStats[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("player_stats_v2")
        .select("*")
        .order("matches_win_pct", { ascending: false })
        .order("matches_won", { ascending: false })
        .order("name", { ascending: true });

      if (cancelled) return;

      if (error) {
        setError(error.message);
        setData(null);
      } else {
        setData(data as PlayerStats[]);
      }
      setLoading(false);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  return { data, loading, error };
}
