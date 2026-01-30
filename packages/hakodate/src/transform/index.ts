import type { StatusSnapshot, Spot, DateData } from "../types";
import { TARGET_SPOTS } from "../constants/spots";

function extractHour(timestamp: string): number | null {
  const match = timestamp.match(/T(\d{2}):/);
  if (!match) {
    console.warn(`Invalid timestamp format: "${timestamp}"`);
    return null;
  }
  return parseInt(match[1], 10);
}

function extractDate(timestamp: string): string {
  return timestamp.split("T")[0];
}

interface GroupedData {
  [date: string]: DateData;
}

export function groupSnapshotsByDate(rows: StatusSnapshot[]): DateData[] {
  const grouped: GroupedData = {};

  for (const row of rows) {
    let spots: Spot[];
    try {
      spots = JSON.parse(row.spots);
    } catch {
      console.error(`Invalid JSON in row id=${row.id}: ${row.spots}`);
      continue;
    }

    const date = extractDate(row.timestamp);
    const hour = extractHour(row.timestamp);
    if (hour === null) {
      continue;
    }

    if (!grouped[date]) {
      grouped[date] = {
        date,
        spots: [...TARGET_SPOTS],
        dataByHour: {},
      };
    }

    if (!grouped[date].dataByHour[hour]) {
      grouped[date].dataByHour[hour] = {};
    }

    for (const spot of spots) {
      if (TARGET_SPOTS.includes(spot.name as (typeof TARGET_SPOTS)[number])) {
        // 既にデータがある場合は上書きしない（新しいデータ優先）
        if (!grouped[date].dataByHour[hour][spot.name]) {
          grouped[date].dataByHour[hour][spot.name] = spot.status;
        }
      }
    }
  }

  return Object.values(grouped).sort((a, b) => b.date.localeCompare(a.date));
}
