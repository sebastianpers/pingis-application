import { Container, Spinner, Table } from "react-bootstrap";
import CardComponent from "../shared/CardComponent";
import { useEffect, useState } from "react";
import type { CompletedMatch } from "../types/match";
import { getCompletedMatchesPage } from "../services/matchService";
import { useNavigate } from "react-router-dom";
import dateConverter from "../utils/dateConverter";
import PageSizeSelect from "../shared/pagination/pageSizeSelect";
import PaginationBar from "../shared/pagination/paginationBar";
import BtnBackComponent from "../components/BtnBackComponent";
import NoDataComponent from "../components/NoDataComponent";

const PlayedMatchesPage = () => {
  const navigate = useNavigate();

  const [completedMatches, setCompletedMatches] = useState<
    CompletedMatch[] | null
  >([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPage();
  }, [page, pageSize]);

  const fetchPage = async () => {
    setLoading(true);
    try {
      const { data, total } = await getCompletedMatchesPage(page, pageSize);

      setCompletedMatches(data);
      setTotal(total);
    } finally {
      setLoading(false);
    }
  };

  const navigateToCompletedMatch = (matchId: string) =>
    navigate(`/completed-matches/${matchId}`);

  return (
    <Container className="d-flex justify-content-center">
      <CardComponent>
        <h4 className="fw-bold text-center mb-3">Avslutade matcher</h4>

        {loading && (
          <div className="d-flex justify-content-center">
            <Spinner animation="border" role="status" className="text-orange ">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        )}

        {(!loading && !completedMatches) ||
          (completedMatches?.length === 0 && (
            <NoDataComponent text="Det finns inga avslutade matcher..." />
          ))}

        {!loading && completedMatches && completedMatches?.length > 0 && (
          <>
            <PageSizeSelect
              value={pageSize}
              onChange={(n) => {
                setPageSize(n);
                setPage(1);
              }}
              options={[5, 10, 25, 50]}
              size="sm"
              className="text-orange"
            />

            <Table
              size="sm"
              striped
              responsive
              hover
              className="transparent-table mt-3"
            >
              <thead>
                <tr>
                  <th className="text-orange p-1 text-center text-nowrap">
                    Spelare 1
                  </th>
                  <th className="text-orange p-1 text-center text-nowrap">
                    Spelare 2
                  </th>
                  <th className="text-orange p-1 text-center">Vinnare</th>
                  <th className="text-orange p-1 text-center">Sets</th>
                  <th className="text-orange p-1 text-center">Resultat</th>
                  <th className="text-orange p-1 text-center">Skapad</th>
                </tr>
              </thead>

              <tbody>
                {completedMatches?.map((match) => (
                  <tr
                    className="cursor-pointer"
                    key={match.id}
                    onClick={() => {
                      navigateToCompletedMatch(match.id);
                    }}
                  >
                    <td className="text-orange p-2 text-center text-nowrap">
                      {match?.player1?.name}
                    </td>
                    <td className="text-orange p-2 text-center text-nowrap">
                      {match?.player2?.name}
                    </td>
                    <td className="text-orange p-2 text-center text-nowrap">
                      {match?.winner?.name}
                    </td>
                    <td className="text-orange p-2  text-center text-nowrap">
                      {match.best_of_sets}
                    </td>
                    <td className="text-orange p-2 text-center text-nowrap">
                      {match?.player1_score} - {match?.player2_score}{" "}
                    </td>
                    <td className="text-orange p-1 text-center  pt-2 text-nowrap">
                      {dateConverter(match.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>

            <PaginationBar
              page={page}
              total={total}
              pageSize={pageSize}
              onPageChange={setPage}
              paginationClassName="my-3 pagination-orange"
              summaryClassName="text-white"
            />
          </>
        )}

        <BtnBackComponent classes="text-center" />
      </CardComponent>
    </Container>
  );
};
export default PlayedMatchesPage;
