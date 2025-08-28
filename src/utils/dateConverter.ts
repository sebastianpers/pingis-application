const dateConverter = (date: string | undefined) => {
  if (!date) return;

  return new Date(date).toISOString().split("T")[0];
};

export default dateConverter;
