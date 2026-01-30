import { describe, it, expect } from "vitest";
import { formatDate, isHoliday } from "./dateUtils";

describe("formatDate", () => {
  it("日付文字列を曜日付きフォーマットに変換する", () => {
    expect(formatDate("2025-01-28")).toBe("2025/01/28(火)");
  });

  it("日曜日を正しくフォーマットする", () => {
    expect(formatDate("2025-01-26")).toBe("2025/01/26(日)");
  });

  it("土曜日を正しくフォーマットする", () => {
    expect(formatDate("2025-01-25")).toBe("2025/01/25(土)");
  });

  it("月曜日を正しくフォーマットする", () => {
    expect(formatDate("2025-01-27")).toBe("2025/01/27(月)");
  });
});

describe("isHoliday", () => {
  it("土曜日はtrue", () => {
    expect(isHoliday("2025-01-25")).toBe(true);
  });

  it("日曜日はtrue", () => {
    expect(isHoliday("2025-01-26")).toBe(true);
  });

  it("平日はfalse", () => {
    expect(isHoliday("2025-01-28")).toBe(false);
  });

  it("祝日（元日）はtrue", () => {
    expect(isHoliday("2026-01-01")).toBe(true);
  });

  it("祝日（成人の日）はtrue", () => {
    expect(isHoliday("2026-01-12")).toBe(true);
  });

  it("祝日（建国記念の日）はtrue", () => {
    expect(isHoliday("2026-02-11")).toBe(true);
  });

  it("祝日でない平日はfalse", () => {
    expect(isHoliday("2026-01-05")).toBe(false);
  });
});
