type NoDataProps = {
  text: string;
};

const NoDataComponent = (props: NoDataProps) => {
  return (
    <p className="text-center my-4">
      <em className="text-warning">{props.text}</em>
    </p>
  );
};

export default NoDataComponent;
