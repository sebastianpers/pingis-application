import { QuestionCircle } from "react-bootstrap-icons";
import { STATISTIC_MEANING } from "../consts/statisticMeaning";
import { useState } from "react";

const StatisticMeaning = () => {
  const [toggleInfo, setToggleInfo] = useState(false);

  return (
    <>
      <div className="text-end">
        <QuestionCircle
          color="orange"
          className="cursor-pointer"
          title="Förklaringar för förkortningar i tabellen"
          size={24}
          onClick={() => setToggleInfo((prev) => !prev)}
        />
      </div>

      {toggleInfo && (
        <ul className="text-white text-wrap">
          {STATISTIC_MEANING.map((i) => (
            <li>{i}</li>
          ))}
        </ul>
      )}
    </>
  );
};

export default StatisticMeaning;
