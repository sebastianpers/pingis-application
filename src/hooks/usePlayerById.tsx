import { useEffect, useState } from "react";
import type { Player } from "../types/player";
import { supabase } from "../services/supabaseClient";

export const usePlayer = (id: string | undefined) => {
  const [player, setPlayer] = useState<Player | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!id) {
      setPlayer(null);
      setError(null);
      setIsLoading(false);

      return;
    }

    setIsLoading(true);
    setError(null);

    supabase
      .from("players")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data, error }) => {
        if (error) {
          setError(error.message);
          setPlayer(null);
        } else {
          setPlayer(data);
        }
        setIsLoading(false);
      });
  }, [id]);

  return { player, error, isLoading };
}
