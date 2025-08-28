import { useGoBackOrHome } from "../hooks/useGoBack";

type classProp = {
  classes?: string;
};

const BtnBackComponent = ({ classes }: classProp) => {
  const goBackOrHome = useGoBackOrHome();

  return (
    <div className={`mt-3 ${classes}`}>
      <button className="btn btn-cancel" onClick={goBackOrHome}>
        Tillbaka
      </button>
    </div>
  );
};

export default BtnBackComponent;
