import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { CompletedMatchWithSets } from "../types/match";
import { getCompletedMatchById } from "../services/matchService";
import { Col, Container, Form, Row } from "react-bootstrap";
import CardComponent from "../shared/CardComponent";
import BtnBackComponent from "../components/BtnBackComponent";

const PlayedMatch = () => {
  const { id } = useParams();
  const [completedMatch, setCompletedMatch] =
    useState<CompletedMatchWithSets | null>();
  const [winner, setWinner] = useState<string | undefined>("");

  useEffect(() => {
    if (id) getCompletedMatch(id);
  }, []);

  const getCompletedMatch = async (id: string) => {
    const response = await getCompletedMatchById(id);

    if (response?.player1?.["id"].toString() === response?.winner_id) {
      setWinner(response?.player1?.name);
    }

    if (response?.player2?.["id"].toString() === response?.winner_id) {
      setWinner(response?.player2?.name);
    }

    if (response) {
      setCompletedMatch(response);
    }
  };

  return (
    <Container className="d-flex justify-content-center">
      <CardComponent>
        <div className="border border-2 rounded p-2 border-white">
          <Row className="my-3">
            <Col className="text-white text-center">
              <span className="text-orange fw-bold">Vinnare:</span>{" "}
              <span className="text-info">{winner}</span>
            </Col>
          </Row>

          <Row>
            <Col className="text-white text-center">Poäng</Col>
          </Row>

          <Row>
            <Col className="text-end">
              <h1 className="text-white">{completedMatch?.player1_score}</h1>
            </Col>

            <Col className="text-center p-0 col-1">
              <h1 className="text-white">-</h1>
            </Col>

            <Col className="text-start">
              <h1 className="text-white">{completedMatch?.player2_score}</h1>
            </Col>
          </Row>
        </div>
        <hr className="text-white" />

        {completedMatch?.sets.map((s) => (
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
            </Row>

            <Row>
              <Col>
                <span>{completedMatch?.player1?.name}</span>
                <Form.Control
                  type="number"
                  inputMode="numeric"
                  defaultValue={s?.player1_score?.toString()}
                  disabled
                  className="bg-dark-subtle"
                />
              </Col>

              <Col>
                <span>{completedMatch?.player2?.name}</span>
                <Form.Control
                  type="number"
                  inputMode="numeric"
                  defaultValue={s?.player2_score?.toString()}
                  disabled
                  className="bg-dark-subtle"
                />
              </Col>
            </Row>
          </div>
        ))}

        <Row>
          <Col>
            <BtnBackComponent/>
          </Col>
        </Row>
      </CardComponent>
    </Container>
  );
};

export default PlayedMatch;
