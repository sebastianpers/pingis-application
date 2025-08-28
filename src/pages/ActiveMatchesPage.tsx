import { Col, Container, Row, Spinner, Table } from "react-bootstrap";
import CardComponent from "../shared/CardComponent";
import { useEffect, useState, type MouseEventHandler } from "react";
import { deleteMatch, getActiveMatches } from "../services/matchService";
import type { Match } from "../types/match";
import { useNavigate } from "react-router-dom";
import BtnBackComponent from "../components/BtnBackComponent";
import NoDataComponent from "../components/NoDataComponent";

type PlayerStub = { id: string; username: string | null };

type MatchWithNames = Match & {
  player1: PlayerStub | null;
  player2: PlayerStub | null;
};

const ActiveMatchesPage = () => {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeMatches, setActiveMatches] = useState<MatchWithNames[] | null>(
    null
  );

  useEffect(() => {
    setIsLoading(true);
    fetchActiveMatches();
  }, []);

  const fetchActiveMatches = async (): Promise<void> => {
    const activeMatchesArr = await getActiveMatches();
    setActiveMatches(activeMatchesArr);
    setIsLoading(false);
  };

  const onNavigate = (matchId: string): void => {
    navigate(`/active-match/${matchId}`);
  };

  const handleRemoveMatch =
    (matchId: string): MouseEventHandler<HTMLSpanElement> =>
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      void onRemoveActiveMatch(matchId);
    };

  const onRemoveActiveMatch = async (matchId: string): Promise<void> => {
    await deleteMatch(matchId);

    setActiveMatches((prev) => {
      if (!prev) return prev;

      return prev.filter((am) => am.id !== matchId);
    });
  };

  return (
    <Container className="d-flex justify-content-center mt-5 pt-5 mt-sm-0 pt-sm-0">
      <CardComponent>
        <h4 className="fw-bold text-center mb-3">Pågående matcher</h4>

        {isLoading && (
          <div className="d-flex justify-content-center">
            <Spinner animation="border" role="status" className="text-orange ">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        )}

        {!isLoading && !activeMatches?.length && (
          <NoDataComponent text="Det finns inga pågående matcher..." />
        )}

        {!isLoading && activeMatches && activeMatches?.length > 0 && (
          <Table
            size="sm"
            striped
            responsive
            hover
            className="transparent-table"
          >
            <thead>
              <tr>
                <th className="text-orange p-1 text-nowrap text-center">
                  Spelare 1
                </th>
                <th className="text-orange p-1 text-center">Spelare 2</th>
                <th className="text-orange p-1 text-center">Sets</th>
                <th className="text-orange p-1 text-center">Skapad</th>
                <th className="p-1"></th>
              </tr>
            </thead>

            <tbody>
              {activeMatches?.map((match) => (
                <tr
                  key={match.id}
                  onClick={() => {
                    onNavigate(match.id);
                  }}
                >
                  <td className="text-orange p-2 text-center">
                    {match?.player1?.username}
                  </td>
                  <td className="text-orange p-2 text-center">
                    {match?.player2?.username}
                  </td>
                  <td className="text-orange p-2 text-center">
                    {match.best_of_sets}
                  </td>
                  <td className="text-orange p-1 pt-2 text-center text-nowrap">
                    {new Date(match.created_at).toISOString().split("T")[0]}
                  </td>
                  <td>
                    <span
                      onClick={handleRemoveMatch(match?.id)}
                      className="text-danger fw-bold"
                    >
                      X
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}

        <Row className="mt-3">
          <Col>
            <BtnBackComponent classes="text-center" />
          </Col>
        </Row>
      </CardComponent>
    </Container>
  );
};
export default ActiveMatchesPage;
