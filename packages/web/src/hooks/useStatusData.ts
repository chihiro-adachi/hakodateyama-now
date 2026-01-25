import { useState, useEffect, useCallback, useRef } from 'react';
import type { Index, SpotData, DataByHour } from '../types';
import { TARGET_SPOTS } from '../constants/spots';
import { extractHour } from '../utils/statusUtils';

async function loadIndex(): Promise<Index> {
  const res = await fetch('data/index.json');
  if (!res.ok) throw new Error('index.json not found');
  return res.json();
}

async function loadData(path: string): Promise<SpotData | null> {
  const res = await fetch(path);
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
  const cachedIndex = useRef<Index | null>(null);

  useEffect(() => {
    loadIndex()
      .then((idx) => {
        cachedIndex.current = idx;
        setIndex(idx);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  const loadDateData = useCallback(async (dateStr: string, files: string[]): Promise<DateData | null> => {
    if (dateDataMap.has(dateStr)) {
      return dateDataMap.get(dateStr)!;
    }

    const dataByHour: DataByHour = {};
    const allSpots = new Set<string>();

    for (const file of files.sort()) {
      const data = await loadData(`data/${dateStr}/${file}`);
      if (data && data.spots) {
        const hour = extractHour(file);
        dataByHour[hour] = {};
        for (const spot of data.spots) {
          dataByHour[hour][spot.name] = spot.status;
          allSpots.add(spot.name);
        }
      }
    }

    const spots = TARGET_SPOTS.filter((s) => allSpots.has(s));
    if (spots.length === 0) return null;

    const dateData: DateData = { date: dateStr, spots, dataByHour };
    setDateDataMap((prev) => new Map(prev).set(dateStr, dateData));
    return dateData;
  }, [dateDataMap]);

  return { index, loading, error, loadDateData, dateDataMap };
}
