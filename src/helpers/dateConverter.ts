const dateConverter = (date: string) => {
  return new Date(date).toISOString().split("T")[0];
};

export default dateConverter;
