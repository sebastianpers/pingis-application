import { Container, Spinner, Table } from "react-bootstrap";
import CardComponent from "../shared/CardComponent";
import { useParams } from "react-router-dom";
import { usePlayer } from "../hooks/usePlayerById";
import { usePlayerStatsById } from "../hooks/usePlayerStatsById";
import NoDataComponent from "../components/NoDataComponent";
import dateConverter from "../utils/dateConverter";
import { useGoBackOrHome } from "../hooks/useGoBack";
import StatisticMeaning from "../shared/statisticMeaning";
const PlayerPage = () => {
  const params = useParams();
  const goBack = useGoBackOrHome();

  const { player, error, isLoading } = usePlayer(params?.["id"]);
  const { stats, statsIsLoading, statsError } = usePlayerStatsById(
    params?.["id"]
  );

  if (error)
    return (
      <p className="text-warning text-center">
        Det gick inte att hämta spelaren <br></br>Fel: {error}
      </p>
    );
  if (statsError)
    return (
      <p className="text-warning text-center">
        Det gick inte att hämta statistik <br></br>Fel: {error}
      </p>
    );

  return (
    <Container className="d-flex justify-content-center">
      <CardComponent>
        {isLoading && (
          <div className="d-flex justify-content-center">
            <Spinner animation="border" role="status" className="text-orange ">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        )}

        {!isLoading && (
          <>
            <h4 className="text-center">{player?.username}</h4>

            <p>
              <strong>Namn:</strong> {player?.name}
            </p>
            <p>
              <strong>Skapad:</strong> {dateConverter(player?.created_at)}
            </p>
          </>
        )}

        {statsIsLoading && (
          <div className="d-flex justify-content-center">
            <Spinner animation="border" role="status" className="text-orange ">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        )}

        {!statsIsLoading && (
          <>
            <StatisticMeaning />

            <div className="border border-2 border-secondary rounded p-2 mt-3">
              <Table
                size="sm"
                striped
                responsive
                hover
                className="transparent-table"
              >
                <thead>
                  <tr className="text-left">
                    <th className="p-2 text-center">MV%</th>
                    <th className="p-2 text-center">M</th>
                    <th className="p-2 text-center">V</th>
                    <th className="p-2 text-center">F</th>
                    <th className="p-2 text-center">P</th>
                    <th className="p-2 text-c-n-wrap">P mot</th>
                    <th className="p-2 text-c-n-wrap">+/- P</th>
                    <th className="p-2 text-c-n-wrap">Set V</th>
                    <th className="p-2 text-c-n-wrap">Set F</th>
                    <th className="p-2 text-c-n-wrap">+/- Set</th>
                  </tr>
                </thead>

                <tbody className="bg-transparent">
                  {stats?.map((row) => (
                    <tr key={row.player_id}>
                      <td className="p-2 text-center">
                        {row.matches_win_pct}%
                      </td>
                      <td className="p-2 text-center">{row.matches_played}</td>
                      <td className="p-2 text-center">{row.matches_won}</td>
                      <td className="p-2 text-center">{row.matches_lost}</td>
                      <td className="p-2 text-center">{row.points_for}</td>
                      <td className="p-2 text-center">{row.points_against}</td>
                      <td className="p-2 text-center">{row.points_diff}</td>
                      <td className="p-2 text-center">{row.sets_won}</td>
                      <td className="p-2 text-center">{row.sets_lost}</td>
                      <td className="p-2 text-center">{row.sets_diff}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </>
        )}

        {!statsIsLoading && stats?.length === 0 && (
          <NoDataComponent text="Det finns ingen statistik..." />
        )}

        <button className="btn btn-orange mt-4 text-center" onClick={goBack}>
          Tillbaka
        </button>
      </CardComponent>
    </Container>
  );
};

export default PlayerPage;
