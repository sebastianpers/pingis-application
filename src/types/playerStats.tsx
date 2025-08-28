export type PlayerStats = {
  player_id: string;
  name: string | null;
  username: string;
  matches_played: number;
  matches_won: number;
  matches_lost: number;
  points_for: number;
  points_against: number;
  points_diff: number;
  sets_won: number;
  sets_lost: number;
  sets_diff: number;
  matches_win_pct: number;
};
