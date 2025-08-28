import { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import type { PlayerStats } from "../types/playerStats";

export const usePlayerStatsById = (id: string | undefined) => {
  const [stats, setStats] = useState<PlayerStats[] | null>(null);
  const [statsIsLoading, setLoading] = useState(true);
  const [statsError, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!id) {
        setLoading(false);
        setError(null);

        return;
      }

      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("player_stats_v2")
        .select("*")
        .order("matches_win_pct", { ascending: false })
        .order("matches_won", { ascending: false })
        .order("username", { ascending: true })
        .eq("player_id", id);

      if (cancelled) return;

      if (error) {
        setError(error.message);
        setStats(null);
      } else {
        setStats(data as PlayerStats[]);
      }
      setLoading(false);
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  return { stats, statsIsLoading, statsError };
};
