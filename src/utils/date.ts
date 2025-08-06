// utils/date.ts
import dayjs from "dayjs";

export const formatDate = (date?: string | Date | null) => {
  if (!date) return "";
  return dayjs(date).format("YYYY-MM-DD");
};
