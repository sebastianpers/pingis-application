import { Container } from "react-bootstrap";
import CardComponent from "../shared/CardComponent";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, type ChangeEvent } from "react";
import {
  createUpToTwoPlayers,
  getAllActivePlayers,
} from "../services/playerService";
import type { Player } from "../types/player";
import type { CreateMatch } from "../types/match";
import { createMatchWithSets } from "../services/matchService";

const CreateMatchPage = () => {
  const navigate = useNavigate();

  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [showPlayer2Input, setShowPlayer2Input] = useState<boolean>(false);
  const [playerOne, setPlayerOne] = useState<string>("");
  const [playerTwo, setPlayerTwo] = useState<string>("");
  const [sets, setSets] = useState<number>(3);
  const [selectValue, setSelectValue] = useState<string>("");
  const [errorMessages, setErrorMessages] = useState<Record<string, string>>(
    {}
  );

  useEffect(() => {
    (async () => {
      const { data, error } = await getAllActivePlayers();
      if (error) {
        console.error("Supabase SELECT-fel:", error);
        return;
      }
      setPlayers(data ?? []);
    })();
  }, []);

  useEffect(() => {
    validate();

    if (!showPlayer2Input) {
      setPlayerTwo("");
    }
  }, [playerOne, playerTwo, selectedPlayers, showPlayer2Input]);

  const getUniqueSelectedCount = (): number => {
    const ids = new Set<string>(selectedPlayers);

    if (playerOne.trim()) ids.add(`text:${playerOne.trim()}`);
    if (playerTwo.trim()) ids.add(`text:${playerTwo.trim()}`);

    return ids.size;
  };

  const playerExists = (p1: string, p2: string): boolean => {
    return players.some(
      (player) =>
        player.name.toLowerCase() === p1 || player.name.toLowerCase() === p2
    );
  };

  const canStart =
    Object.keys(errorMessages).length === 0 && getUniqueSelectedCount() === 2;

  const validate = () => {
    const errors: Record<string, string> = {};

    const p1 = playerOne.trim().toLocaleLowerCase();
    const p2 = playerTwo.trim().toLocaleLowerCase();

    if (playerExists(p1, p2)) {
      errors.nameExists = "Namnet finns redan.";
    }

    if (p1 && p2 && p1 === p2) {
      errors.sameName = "Spelarna kan inte ha samma namn";
    }

    if (!p1 && !p2 && selectedPlayers.length === 0) {
      errors.missingPlayers = "Du måste välja två spelare";
    }

    // Max 2 totalt
    const totalUnique = getUniqueSelectedCount();

    if (totalUnique > 2) {
      errors.tooManyPlayers = "För många spelare valda (max 2)";
    }

    setErrorMessages(errors);
  };

  const handleSelectedPlayers = (e: ChangeEvent<HTMLSelectElement>) => {
    const playerId = e.target.value;

    if (!playerId) return;

    setSelectedPlayers((prev) =>
      prev.includes(playerId)
        ? prev.filter((id) => id !== playerId)
        : [...prev, playerId]
    );

    setSelectValue("");
  };

  const createMatch = async () => {
    const names = [playerOne, playerTwo]
      .map((s) => s?.trim())
      .filter((s): s is string => Boolean(s))
      .map(firstCharToUpper);

    const createdPlayers =
      names.length > 0 ? await createUpToTwoPlayers(names) : [];

    const createdIds = createdPlayers.map((p) => p.id);
    const selectedIds = selectedPlayers;
    const ids = Array.from(new Set([...createdIds, ...selectedIds])).slice(
      0,
      2
    );

    if (ids.length < 2) {
      return;
    }

    const [player1_id, player2_id] = ids as [string, string];

    const match: CreateMatch = {
      player1_id,
      player2_id,
      best_of_sets: sets,
      status: "ACTIVE",
      player1_score: 0,
      player2_score: 0,
    };

    const ans = await createMatchWithSets(match);
    navigate(`/active-match/${ans.match.id}`);
  };

  const firstCharToUpper = (word: string) =>
    word.charAt(0).toUpperCase() + word.slice(1);

  return (
    <Container className="d-flex justify-content-center">
      <CardComponent classes="card-component-sm">
        <h4 className="fw-bold text-center mb-3">Skapa match</h4>

        <Row>
          <Col>
            <Form.Control
              type="text"
              placeholder="Spelare 1"
              value={playerOne}
              onChange={(e) => setPlayerOne(e.target.value)}
            />
          </Col>
        </Row>

        <br />

        <button
          className="btn btn-sm mb-4 fw-bold"
          onClick={() => setShowPlayer2Input((prev) => !prev)}
        >
          {showPlayer2Input ? "Ta bort spelare 2" : "Lägg till spelare 2"}
        </button>

        {showPlayer2Input && (
          <Row>
            <Col>
              <Form.Control
                type="text"
                placeholder="Spelare 2"
                value={playerTwo}
                onChange={(e) => setPlayerTwo(e.target.value)}
              />
            </Col>
          </Row>
        )}

        <br />

        <Row>
          <Col>
            <Form.Group>
              <Form.Select
                className="text-orange"
                aria-label="Välj spelare"
                value={selectValue}
                onChange={handleSelectedPlayers}
              >
                <option value="">Välj spelare…</option>
                {players.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        <br />

        <Row>
          <Col>
            <div className="mb-2 text-orange">
              <strong className="text-uppercase fw-bold">Valda spelare:</strong>{" "}
              <br />
              <small>
                <em className="text-white text-uppercase">
                  {[playerOne, playerTwo]
                    .map((pName) => pName?.trim())
                    .filter(Boolean)
                    .join(", ")}

                  {(selectedPlayers.length > 0 && playerOne.length) ||
                  playerTwo.length
                    ? ", "
                    : ""}

                  {selectedPlayers
                    .map((id) => players.find((p) => p.id === id)?.name ?? id)
                    .join(", ")}
                </em>
              </small>
            </div>

            {Object.values(errorMessages).length > 0 && (
              <ul className="text-warning mb-3 list-unstyled">
                {Object.entries(errorMessages).map(([k, v]) => (
                  <li key={k}>{v}</li>
                ))}
              </ul>
            )}
          </Col>
        </Row>

        <Row>
          <Col>
            <strong className="text-orange text-uppercase fw-bold">
              Antal set:
            </strong>
            <Form.Control
              type="number"
              placeholder="Sets"
              value={sets}
              onChange={(e) => setSets(parseInt(e.target.value))}
            />
          </Col>
        </Row>

        <Row className="mt-4">
          <Col>
            <button
              type="button"
              className="btn btn-cancel"
              onClick={() => navigate("/")}
            >
              Avbryt
            </button>
          </Col>

          <Col className="text-end">
            <button
              className="btn"
              disabled={!canStart}
              onClick={() => createMatch()}
              title={!canStart ? "Välj exakt två spelare" : "Starta match"}
            >
              Klar
            </button>
          </Col>
        </Row>
      </CardComponent>
    </Container>
  );
};

export default CreateMatchPage;
