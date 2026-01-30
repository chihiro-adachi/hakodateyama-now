import { formatDate, isHoliday } from "../utils/dateUtils";
import type { DataByHour } from "../../types";
import { StatusTable } from "./StatusTable";

interface DateSectionProps {
  date: string;
  spots: string[];
  dataByHour: DataByHour;
}

export function DateSection({ date, spots, dataByHour }: DateSectionProps) {
  return (
    <div class="date-section" data-holiday={isHoliday(date) ? "true" : "false"}>
      <h2>{formatDate(date)}</h2>
      <StatusTable spots={spots} dataByHour={dataByHour} />
    </div>
  );
}
