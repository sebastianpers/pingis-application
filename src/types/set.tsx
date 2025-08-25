export type MatchSet = {
  created_at: string;
  id: string;
  match_id: string;
  player1_id: string;
  player1_score: number | null;
  player2_id: string;
  player2_score: number | null;
  set_number: number;
  winner_id: string | null;
};
