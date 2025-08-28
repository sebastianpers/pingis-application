import { Container } from "react-bootstrap";
import CardComponent from "../shared/CardComponent";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, type ChangeEvent } from "react";
import { getAllActivePlayers } from "../services/playerService";
import type { Player } from "../types/player";
import type { CreateMatch } from "../types/match";
import { createMatchWithSets } from "../services/matchService";

const CreateMatchPage = () => {
  const navigate = useNavigate();

  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [sets, setSets] = useState<number>(3);
  const [selectValue, setSelectValue] = useState<string>("");
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
    if (selectedPlayers.length < 2) return;

    const [player1_id, player2_id] = selectedPlayers as [string, string];

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

  const navigateToCreatePlayer = () => {
    navigate("/create-players");
  };

  return (
    <Container className="d-flex justify-content-center">
      <CardComponent classes="card-component-sm">
        <h4 className="fw-bold text-center mb-3">Skapa match</h4>

        <Row>
          <Col>
            <Form.Select
              className="text-darkk"
              aria-label="Välj spelare"
              value={selectValue}
              onChange={handleSelectedPlayers}
            >
              <option value="">Välj spelare…</option>
              {players.map((player) => (
                <option key={player.id} value={player.id}>
                  {player.username}
                </option>
              ))}
            </Form.Select>
          </Col>
        </Row>

        <Row className="mt-2">
          <Col className="text-center">
            <small className="text-warning" onClick={navigateToCreatePlayer}>
              Saknar spelare? Skapa en HÄR
            </small>
          </Col>
        </Row>

        {selectedPlayers.length > 0 && (
          <Row className="mt-3">
            <Col>
              <div className="mb-2 text-orange">
                <strong className="text-uppercase fw-bold">
                  Valda spelare:
                </strong>{" "}
                <br />
                <small>
                  <em className="text-white text-uppercase">
                    {selectedPlayers
                      .map((id) => players.find((p) => p.id === id)?.name ?? id)
                      .join(", ")}
                  </em>
                </small>
              </div>
            </Col>
          </Row>
        )}

        <Row className="mt-3">
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
            <button className="btn" onClick={() => createMatch()}>
              Klar
            </button>
          </Col>
        </Row>
      </CardComponent>
    </Container>
  );
};

export default CreateMatchPage;
