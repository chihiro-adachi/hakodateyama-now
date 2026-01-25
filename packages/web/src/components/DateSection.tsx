import { useEffect, useState } from 'react';
import { formatDate } from '../utils/dateUtils';
import { StatusTable } from './StatusTable';
import type { DateData } from '../hooks/useStatusData';

interface DateSectionProps {
  date: string;
  files: string[];
  loadDateData: (date: string, files: string[]) => Promise<DateData | null>;
}

export function DateSection({ date, files, loadDateData }: DateSectionProps) {
  const [dateData, setDateData] = useState<DateData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDateData(date, files).then((data) => {
      setDateData(data);
      setLoading(false);
    });
  }, [date, files, loadDateData]);

  if (loading) {
    return (
      <div className="date-section">
        <h2>{formatDate(date)}</h2>
        <div className="loading">読み込み中...</div>
      </div>
    );
  }

  if (!dateData) {
    return null;
  }

  return (
    <div className="date-section">
      <h2>{formatDate(date)}</h2>
      <StatusTable spots={dateData.spots} dataByHour={dateData.dataByHour} />
    </div>
  );
}
