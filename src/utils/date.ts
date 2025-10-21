import dayjs from "dayjs";

export const formatDate = (date?: string | Date | null) => {
  if (!date) return "";
  const parsed = dayjs(date);
  return parsed.isValid() ? parsed.format("DD/MM/YYYY") : "";
};
