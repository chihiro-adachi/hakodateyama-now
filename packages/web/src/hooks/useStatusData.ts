import { useState, useEffect, useCallback, useRef } from 'react';
import type { Index, DailyData, DataByHour } from '../types';
import { TARGET_SPOTS } from '../constants/spots';

async function loadIndex(): Promise<Index> {
  const res = await fetch('data/index.json');
  if (!res.ok) throw new Error('index.json not found');
  return res.json();
}

async function loadDailyData(dateStr: string): Promise<DailyData | null> {
  const res = await fetch(`data/${dateStr}/daily.json`);
  if (!res.ok) return null;
  return res.json();
}

export interface DateData {
  date: string;
  spots: string[];
  dataByHour: DataByHour;
}

export function useStatusData() {
  const [index, setIndex] = useState<Index | null>(null);
  const [dateDataMap, setDateDataMap] = useState<Map<string, DateData>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dateDataCache = useRef<Map<string, DateData>>(new Map());

  useEffect(() => {
    loadIndex()
      .then((idx) => {
        setIndex(idx);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  const loadDateData = useCallback(async (dateStr: string): Promise<DateData | null> => {
    if (dateDataCache.current.has(dateStr)) {
      return dateDataCache.current.get(dateStr)!;
    }

    const dailyData = await loadDailyData(dateStr);
    if (!dailyData) return null;

    const dataByHour: DataByHour = {};
    const allSpots = new Set<string>();

    for (const [hour, spots] of Object.entries(dailyData.hours)) {
      dataByHour[Number(hour)] = spots;
      Object.keys(spots).forEach(name => allSpots.add(name));
    }

    const spots = TARGET_SPOTS.filter((s) => allSpots.has(s));
    if (spots.length === 0) return null;

    const dateData: DateData = { date: dateStr, spots, dataByHour };
    dateDataCache.current.set(dateStr, dateData);
    setDateDataMap(new Map(dateDataCache.current));
    return dateData;
  }, []);

  return { index, loading, error, loadDateData, dateDataMap };
}
