import { HOURS, SHORT_NAMES } from '../constants/spots';
import { useIsMobile } from '../hooks/useMediaQuery';
import type { DataByHour } from '../types';
import { StatusCell } from './StatusCell';

interface StatusTableProps {
  spots: string[];
  dataByHour: DataByHour;
}

export function StatusTable({ spots, dataByHour }: StatusTableProps) {
  const isMobile = useIsMobile();
  const getSpotName = (name: string) => (isMobile ? SHORT_NAMES[name] || name : name);

  return (
    <table>
      <thead>
        <tr>
          <th className="time-col">時間</th>
          {spots.map((spot) => (
            <th key={spot}>{getSpotName(spot)}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {HOURS.map((hour) => (
          <tr key={hour}>
            <td className="time-col">{hour}時</td>
            {spots.map((spot) => {
              const status = dataByHour[hour]?.[spot] || '-';
              return <StatusCell key={spot} status={status} />;
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
