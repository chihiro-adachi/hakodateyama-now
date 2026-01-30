import { HOLIDAYS_2026 } from "../constants/holidays";

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

export function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  const weekday = WEEKDAYS[date.getDay()];
  return `${year}/${month}/${day}(${weekday})`;
}

export function isHoliday(dateStr: string): boolean {
  const [year, month, day] = dateStr.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  const dayOfWeek = date.getDay();
  return dayOfWeek === 0 || dayOfWeek === 6 || HOLIDAYS_2026.has(dateStr);
}
