export type Player = {
  created_at: string;
  id: string;
  losses: number;
  name: string;
  sets_lost: number;
  sets_played: number;
  sets_won: number;
  total_score: number;
  total_score_against: number;
  wins: number;
};

export type PlayerStub = { id: string; name: string };
