import { useState } from 'react';
import { Header } from './components/Header';
import { HolidayFilter } from './components/HolidayFilter';
import { DateSection } from './components/DateSection';
import { useStatusData } from './hooks/useStatusData';
import { isHoliday } from './utils/dateUtils';
import './App.css';

export default function App() {
  const [holidayOnly, setHolidayOnly] = useState(false);
  const { index, loading, error, loadDateData } = useStatusData();

  if (loading) {
    return (
      <>
        <Header />
        <HolidayFilter checked={holidayOnly} onChange={setHolidayOnly} />
        <div id="app">
          <div className="loading">データを読み込み中...</div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <HolidayFilter checked={holidayOnly} onChange={setHolidayOnly} />
        <div id="app">
          <div className="no-data">データの読み込みに失敗しました: {error}</div>
        </div>
      </>
    );
  }

  if (!index || !index.dates || index.dates.length === 0) {
    return (
      <>
        <Header />
        <HolidayFilter checked={holidayOnly} onChange={setHolidayOnly} />
        <div id="app">
          <div className="no-data">データがありません</div>
        </div>
      </>
    );
  }

  const filteredDates = holidayOnly
    ? index.dates.filter((d) => isHoliday(d.date))
    : index.dates;

  return (
    <>
      <Header />
      <HolidayFilter checked={holidayOnly} onChange={setHolidayOnly} />
      <div id="app">
        {filteredDates.length === 0 ? (
          <div className="no-data">データがありません</div>
        ) : (
          filteredDates.map((dateInfo) => (
            <DateSection
              key={dateInfo.date}
              date={dateInfo.date}
              files={dateInfo.files}
              loadDateData={loadDateData}
            />
          ))
        )}
      </div>
    </>
  );
}
