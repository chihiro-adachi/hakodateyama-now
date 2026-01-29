import type { StatusSnapshot, DateData, SidebarData } from '../types';
import { groupSnapshotsByDate } from '../transform';

const MAX_SNAPSHOTS = 1000;

export async function saveStatusSnapshot(db: D1Database, data: SidebarData): Promise<void> {
  try {
    await db
      .prepare('INSERT INTO status_snapshots (timestamp, spots) VALUES (?, ?)')
      .bind(data.timestamp, JSON.stringify(data.spots))
      .run();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to save snapshot at ${data.timestamp}: ${message}`);
  }
}

export async function getStatusData(db: D1Database): Promise<DateData[]> {
  const result = await db
    .prepare('SELECT id, timestamp, spots FROM status_snapshots ORDER BY timestamp DESC LIMIT ?')
    .bind(MAX_SNAPSHOTS)
    .all<StatusSnapshot>();

  if (!result.results) {
    return [];
  }

  return groupSnapshotsByDate(result.results);
}
