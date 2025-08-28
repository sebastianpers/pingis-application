import { Spinner, Table } from "react-bootstrap";
import { usePlayerStats } from "../hooks/usePlayerStats";
import NoDataComponent from "./NoDataComponent";

const StatisticsTable = () => {
  const { data, loading, error } = usePlayerStats();

  if (error)
    return (
      <div className="text-warning text-center">
        Kunde inte hämta statistik: {error}
      </div>
    );

  return (
    <div className="overflow-x-auto">
      {loading && (
        <div className="d-flex justify-content-center">
          <Spinner animation="border" role="status" className="text-orange ">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      )}

      {!loading && data?.length === 0 && (
        <NoDataComponent text="Det finns ingen statistik tillgänglig..." />
      )}

      {!loading && data && data?.length > 0 && (
        <Table size="sm" striped responsive hover className="transparent-table">
          <thead>
            <tr className="text-left">
              <th className="p-2 text-nowrap">Spelare</th>
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
            {data?.map((row) => (
              <tr
                key={row.player_id}
                className="bg-white hover:bg-gray-50 border-bottom"
              >
                <td className="p-2 font-mediumtext-orange">
                  {row.username ?? "Okänd"}
                </td>
                <td className="p-2 text-center">{row.matches_win_pct}%</td>
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
      )}
    </div>
  );
};

export default StatisticsTable;
