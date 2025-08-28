import { Container } from "react-bootstrap";
import CardComponent from "../shared/CardComponent";
import StatisticsTable from "../components/StatisticsTable";
import BtnBackComponent from "../components/BtnBackComponent";
import StatisticMeaning from "../shared/statisticMeaning";

const StatisticPage = () => {
  return (
    <Container className="d-flex align-items-center flex-column">
      <CardComponent classes="mt-5 mb-5">
        <h4 className="fw-bold text-center mb-3">Spelarstatistik</h4>

        <StatisticMeaning />

        <StatisticsTable />

        <BtnBackComponent classes="mt-4 text-center" />
      </CardComponent>
    </Container>
  );
};

export default StatisticPage;
