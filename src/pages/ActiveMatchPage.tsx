import { Col, Container, Form, Row } from "react-bootstrap";
import CardComponent from "../shared/CardComponent";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  getMatchById,
  saveMatch,
  updateSetNumber,
} from "../services/matchService";
import type { MatchWithSets } from "../types/match";
import { getPlayerNamesByIds } from "../services/playerService";
import { STATUS } from "../enum/status";
import { deleteSet } from "../services/setService";

type SetScoreValue = "" | number;
type PlayerKey = "p1" | "p2";
type ScoreValue = number | "";
type SetScores = Record<string, { p1: ScoreValue; p2: ScoreValue }>;

const ActiveMatchPage = () => {
  const params = useParams();
  const navigate = useNavigate();

  const [match, setMatch] = useState<MatchWithSets | null>(null);
  const [setScores, setSetScores] = useState<SetScores>({});
  const [playerOne, setPlayerOne] = useState<string>("");
  const [playerTwo, setPlayerTwo] = useState<string>("");
  const [saveStatus, setSaveStatus] = useState<STATUS>(STATUS.ACTIVE);

  useEffect(() => {
    getActiveMatch();
  }, [params]);

  useEffect(() => {
    if (!match) return;
    const initial: SetScores = Object.fromEntries(
      match.sets.map((s) => [
        s.id,
        {
          p1: s.player1_score ?? "",
          p2: s.player2_score ?? "",
        },
      ])
    );

    setSetScores(initial);
  }, [match?.id]);

  const getActiveMatch = async () => {
    if (params.id) {
      const match = await getMatchById(params.id);

      const playerNamesAndIds = await getPlayerNamesByIds([
        match.player1_id,
        match.player2_id,
      ]);

      setPlayerOne(playerNamesAndIds[0]?.name);
      setPlayerTwo(playerNamesAndIds[1]?.name);
      setMatch(match);
    }
  };

  const handleScoreChange =
    (setId: string, field: "p1" | "p2") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      const val: SetScoreValue = raw === "" ? "" : Number(raw);

      if (val !== "" && Number.isNaN(val)) return;

      setSetScores((prev) => ({
        ...prev,
        [setId]: { ...prev[setId], [field]: val },
      }));
    };

  const calculateScore = (player: PlayerKey) => {
    const res = Object.values(setScores).reduce((sum, playerScore) => {
      const score = Number(playerScore[player]);

      return sum + (Number.isFinite(score) ? score : 0);
    }, 0);

    return res;
  };

  // Ongoing or completed match
  const onStatusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSaveStatus(e.currentTarget.value as STATUS);
  };

  const normalizeScore = (v: unknown): number | null =>
    typeof v === "number" && Number.isFinite(v) ? v : null;

  const buildNextMatch = (
    prev: MatchWithSets,
    setScores: SetScores,
    status: STATUS
  ): MatchWithSets => {
    let p1SetWinsCount = 0;
    let p2SetWinsCount = 0;

    let expectedHighScore: number | null = null;

    for (const setRow of prev.sets) {
      const input = setScores[setRow.id];
      const dbP1 = normalizeScore(setRow.player1_score);
      const dbP2 = normalizeScore(setRow.player2_score);
      const n1 = normalizeScore(input?.p1) ?? dbP1;
      const n2 = normalizeScore(input?.p2) ?? dbP2;

      if (n1 !== null && n2 !== null && n1 !== n2) {
        expectedHighScore = Math.max(n1, n2);
        break;
      }
    }

    const winnersBySet: Record<string, string | null> = {};

    for (const setRow of prev.sets) {
      const input = setScores[setRow.id];
      const p1 =
        normalizeScore(input?.p1) ?? normalizeScore(setRow.player1_score);
      const p2 =
        normalizeScore(input?.p2) ?? normalizeScore(setRow.player2_score);

      if (p1 === null || p2 === null || p1 === p2) {
        winnersBySet[setRow.id] = null;
        continue;
      }

      const high = Math.max(p1, p2);
      const target = expectedHighScore ?? high;
      if (high !== target) {
        winnersBySet[setRow.id] = null;
        continue;
      }

      const winnerId = p1 > p2 ? prev.player1_id : prev.player2_id;
      winnersBySet[setRow.id] = winnerId;

      if (winnerId === prev.player1_id) p1SetWinsCount++;
      else p2SetWinsCount++;
    }

    const matchWinnerId =
      p1SetWinsCount === p2SetWinsCount
        ? null
        : p1SetWinsCount > p2SetWinsCount
        ? prev.player1_id
        : prev.player2_id;

    const nextSets = prev.sets.map((setRow) => {
      const input = setScores[setRow.id];
      const nextP1 =
        normalizeScore(input?.p1) ?? normalizeScore(setRow.player1_score);
      const nextP2 =
        normalizeScore(input?.p2) ?? normalizeScore(setRow.player2_score);
      const nextWinner = winnersBySet[setRow.id] ?? setRow.winner_id ?? null;

      return {
        ...setRow,
        player1_score: nextP1,
        player2_score: nextP2,
        winner_id: nextWinner,
      };
    });

    const p1GamesTotal = nextSets.reduce(
      (acc, s) => acc + (s.player1_score ?? 0),
      0
    );
    const p2GamesTotal = nextSets.reduce(
      (acc, s) => acc + (s.player2_score ?? 0),
      0
    );

    return {
      ...prev,
      sets: nextSets,
      winner_id: matchWinnerId,
      player1_score: p1GamesTotal,
      player2_score: p2GamesTotal,
      status,
    };
  };

  const handleMatchStatus = async () => {
    if (!match) return;

    const next = buildNextMatch(match, setScores, saveStatus);
    setMatch(next);

    try {
      await saveMatch(next);
      navigate("/");
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteSet = async (setId: string) => {
    try {
      if (match?.best_of_sets) {
        await deleteSet(setId);
        await updateSetNumber(match?.best_of_sets - 1, match?.id);

        setMatch((prev) => {
          if (!prev) return prev;
          const updatedSets = prev.sets?.filter((s) => s.id !== setId) ?? [];

          return {
            ...prev,
            sets: updatedSets,
            best_of_sets: updatedSets.length > 0 ? updatedSets.length : 0,
          };
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Container className="d-flex justify-content-center">
      <CardComponent classes="mb-5">
        <div className="border border-2 rounded p-2 border-white">
          <Row>
            <Col className="text-white text-center">Poäng</Col>
          </Row>

          <Row>
            <Col className="text-end">
              <h1 className="text-white">{calculateScore("p1")}</h1>
            </Col>

            <Col className="text-center p-0 col-1">
              <h1 className="text-white">-</h1>
            </Col>

            <Col className="text-start">
              <h1 className="text-white">{calculateScore("p2")}</h1>
            </Col>
          </Row>
        </div>
        <hr className="text-white" />

        {match?.sets.map((s) => (
          <div
            key={s.id}
            className="border border-2 border-secondary pt-2 pb-4 px-4 my-4 rounded"
          >
            <Row className="mt-2">
              <Col className="d-flex justify-content-center">
                <div className="text-orange mb-2 fw-bold">
                  Set #{s.set_number}
                </div>
              </Col>

              <Col className="col-1">
                <span
                  onClick={() => handleDeleteSet(s.id)}
                  className="text-danger fw-bold"
                >
                  X
                </span>
              </Col>
            </Row>

            <Row>
              <Col>
                <div className="text-center text-orange">{playerOne}</div>
                <Form.Control
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={1}
                  value={setScores[s.id]?.p1 ?? ""}
                  onChange={handleScoreChange(s.id, "p1")}
                />
              </Col>

              <Col>
                <div className="text-center text-orange">{playerTwo}</div>
                <Form.Control
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={1}
                  value={setScores[s.id]?.p2 ?? ""}
                  onChange={handleScoreChange(s.id, "p2")}
                />
              </Col>
            </Row>
          </div>
        ))}

        <Row>
          <div className="d-flex flex-column">
            <small className="text-warning">
              Spara:{" "}
              <em className="text-white">Fortsätt vid ett senare tillfälle.</em>
            </small>
            <small className="text-warning">
              Avsluta: <em className="text-white">Färdigspelad match.</em>
            </small>
          </div>

          <Col className="text-orange form-check mt-3">
            <label className="form-check w-100 d-flex justify-content-center">
              <input
                type="radio"
                className="form-check-input me-2"
                name="save"
                value={STATUS.ACTIVE}
                checked={saveStatus === STATUS.ACTIVE}
                onChange={onStatusChange}
              />
              Spara
            </label>
          </Col>

          <Col className="text-orange form-check mt-3">
            <label className="form-check d-flex justify-content-center">
              <input
                type="radio"
                className="form-check-input me-2"
                name="save"
                value={STATUS.COMPLETED}
                checked={saveStatus === STATUS.COMPLETED}
                onChange={onStatusChange}
              />
              Avsluta
            </label>
          </Col>
        </Row>

        <Row className="mt-4">
          <Col>
            <button
              type="button"
              className="btn btn-sm btn-cancel w-100"
              name="flexRadioDefault"
              onClick={() => navigate("/")}
            >
              Avbryt
            </button>
          </Col>

          <Col className="text-end">
            <button
              className="btn btn-sm text-uppercase w-100"
              name="flexRadioDefault"
              onClick={() => handleMatchStatus()}
            >
              {saveStatus === STATUS.ACTIVE ? "Spara" : "Avsluta"}
            </button>
          </Col>
        </Row>
      </CardComponent>
    </Container>
  );
};

export default ActiveMatchPage;
