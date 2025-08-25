import type { PlayerStub } from "./player";
import type { MatchSet } from "./set";

export type CreateMatch = {
  player1_id: string;
  player2_id: string;
  best_of_sets: number;
  status: string;
  player1_score: number;
  player2_score: number;
};

export type Match = {
  id: string;
  player1_id: string;
  player2_id: string;
  best_of_sets: number;
  status: "ACTIVE" | "COMPLETED";
  player1_score: number;
  player2_score: number;
  created_at: string;
  winner_id: string | null;
};

export type MatchWithSets = Match & {
  sets: MatchSet[];
};

export type CompletedMatch = Match & {
  player1: PlayerStub | null; // kan vara null om FK saknas/pekar fel
  player2: PlayerStub | null;
  winner: PlayerStub | null;
};

export type CompletedMatchWithSets = CompletedMatch & MatchWithSets;
