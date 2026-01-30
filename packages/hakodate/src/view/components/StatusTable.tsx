import { HOURS, SHORT_NAMES } from '../../constants/spots';
import type { DataByHour } from '../../types';
import { StatusCell } from './StatusCell';

interface StatusTableProps {
  spots: string[];
  dataByHour: DataByHour;
}

export function StatusTable({ spots, dataByHour }: StatusTableProps) {
  return (
    <table>
      <thead>
        <tr>
          <th class="time-col">時間</th>
          {spots.map((spot) => (
            <th key={spot}>
              <span class="spot-full">{spot}</span>
              <span class="spot-short">{SHORT_NAMES[spot] || spot}</span>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {HOURS.map((hour) => (
          <tr key={hour}>
            <td class="time-col">{hour}時</td>
            {spots.map((spot) => {
              const status = dataByHour[hour]?.[spot] || '-';
              return <StatusCell key={`${hour}-${spot}`} status={status} />;
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
