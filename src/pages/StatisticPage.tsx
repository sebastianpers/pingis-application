import { Container } from "react-bootstrap";
import CardComponent from "../shared/CardComponent";
import StatisticsTable from "../components/StatisticsTable";
import { QuestionCircle } from "react-bootstrap-icons";
import { useState } from "react";
import BtnBackComponent from "../components/BtnBackComponent";

const StatisticPage = () => {
  const [toggleInfo, setToggleInfo] = useState(false);

  const info = [
    "MV% = Matchvinster i %",
    "M = Matcher spelade",
    "V = Vunna matcher",
    "F = Förlorade matcher",
    "P = Poäng",
    "+/- P = Plus minus poäng",
    "Set V = Set vunna",
    "Set F = Set förlorade",
    "+/- = Plus minus i set",
  ];

  return (
    <Container className="d-flex align-items-center flex-column">
      <CardComponent classes="mt-5 mb-5">
        <h4 className="fw-bold text-center mb-3">Spelarstatistik</h4>
        {toggleInfo && (
          <ul className="text-white text-wrap">
            {info.map((i) => (
              <li>{i}</li>
            ))}
          </ul>
        )}

        <div className="text-end">
          <QuestionCircle
            color="orange"
            size={24}
            onClick={() => setToggleInfo((prev) => !prev)}
          />
        </div>

        <StatisticsTable />

        <BtnBackComponent classes="mt-4" />
      </CardComponent>
    </Container>
  );
};

export default StatisticPage;
