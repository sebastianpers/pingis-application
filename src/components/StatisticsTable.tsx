import { Spinner } from "react-bootstrap";
import { usePlayerStats } from "../hooks/usePlayerStats";
import NoDataComponent from "./NoDataComponent";

export default StatisticsTable;

export function StatisticsTable() {
  const { data, loading, error } = usePlayerStats();

  if (error) return <div>Kunde inte hämta statistik: {error}</div>;

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
        <table className="min-w-full w-100 border-separate border-spacing-y-1 transparent-table">
          <thead>
            <tr className="text-left">
              <th className="p-2 text-orange text-nowrap">Spelare</th>
              <th className="p-2 text-orange">MV%</th>
              <th className="p-2 text-orange">M</th>
              <th className="p-2 text-orange">V</th>
              <th className="p-2 text-orange">F</th>
              <th className="p-2 text-orange">P</th>
              <th className="p-2 text-orange text-nowrap">P mot</th>
              <th className="p-2 text-orange text-nowrap">+/- P</th>
              <th className="p-2 text-orange text-nowrap">Set V</th>
              <th className="p-2 text-orange text-nowrap">Set F</th>
              <th className="p-2 text-orange text-nowrap">+/- Set</th>
            </tr>
          </thead>

          <tbody className="bg-transparent">
            {data?.map((row) => (
              <tr
                key={row.player_id}
                className="bg-white hover:bg-gray-50 border-bottom"
              >
                <td className="p-2 font-medium text-orange">
                  {row.name ?? "Okänd"}
                </td>
                <td className="p-2 text-orange">{row.matches_win_pct}%</td>
                <td className="p-2 text-orange">{row.matches_played}</td>
                <td className="p-2 text-orange">{row.matches_won}</td>
                <td className="p-2 text-orange">{row.matches_lost}</td>
                <td className="p-2 text-orange">{row.points_for}</td>
                <td className="p-2 text-orange">{row.points_against}</td>
                <td className="p-2 text-orange">{row.points_diff}</td>
                <td className="p-2 text-orange">{row.sets_won}</td>
                <td className="p-2 text-orange">{row.sets_lost}</td>
                <td className="p-2 text-orange">{row.sets_diff}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
