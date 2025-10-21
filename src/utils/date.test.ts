import { describe, it, expect } from "vitest";
import { formatDate } from "./date";
import dayjs from "dayjs";

describe("formatDate utility", () => {
  it("should return formatted date string when given a Date object", () => {
    const date = new Date(2025, 0, 15); // 15 Jan 2025
    expect(formatDate(date)).toBe(dayjs(date).format("DD/MM/YYYY"));
  });

  it("should return formatted date string when given a date string", () => {
    const dateStr = "2025-10-15T00:00:00Z";
    expect(formatDate(dateStr)).toBe(dayjs(dateStr).format("DD/MM/YYYY"));
  });

  it("should return empty string when given null", () => {
    expect(formatDate(null)).toBe("");
  });

  it("should return empty string when given undefined", () => {
    expect(formatDate(undefined)).toBe("");
  });

  it("should return empty string when given an invalid date string", () => {
    expect(formatDate("invalid-date")).toBe("Invalid Date" ? "" : "");
    // tuỳ vào logic ông muốn, ở đây hiện tại dayjs("invalid-date") vẫn tạo đối tượng hợp lệ,
    // nên kết quả vẫn là "Invalid Date" format, nếu muốn test strict invalid, cần sửa code.
  });
});
