import dayjs from "dayjs";

export const formatDate = (date?: string | Date | null) => {
  if (!date) return "";
  return dayjs(date).format("DD/MM/YYYY");
};
