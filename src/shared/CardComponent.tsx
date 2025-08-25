import type { ReactNode } from "react";

type CardComponentProps = {
  children: ReactNode;
  classes?: string;
};

const CardComponent = ({ children, classes = "" }: CardComponentProps) => {
  return (
    <div className={`p-2 border-orange p-4 rounded card-component ${classes}`}>
      {children}
    </div>
  );
};

export default CardComponent;
