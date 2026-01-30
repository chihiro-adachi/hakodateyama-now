import { describe, it, expect, vi } from "vitest";
import { saveStatusSnapshot, getStatusData } from "./index";
import type { SidebarData } from "../types";

function createMockDb(options: {
  runResult?: { success: boolean };
  allResult?: { results: unknown[] };
  runError?: Error;
  allError?: Error;
}) {
  const mockRun = options.runError
    ? vi.fn().mockRejectedValue(options.runError)
    : vi.fn().mockResolvedValue(options.runResult ?? { success: true });

  const mockAll = options.allError
    ? vi.fn().mockRejectedValue(options.allError)
    : vi.fn().mockResolvedValue(options.allResult ?? { results: [] });

  return {
    prepare: vi.fn().mockReturnValue({
      bind: vi.fn().mockReturnValue({
        run: mockRun,
        all: mockAll,
      }),
    }),
    _mockRun: mockRun,
    _mockAll: mockAll,
  } as unknown as D1Database & {
    _mockRun: ReturnType<typeof vi.fn>;
    _mockAll: ReturnType<typeof vi.fn>;
  };
}

describe("saveStatusSnapshot", () => {
  it("正常にスナップショットを保存できる", async () => {
    const mockDb = createMockDb({ runResult: { success: true } });
    const data: SidebarData = {
      timestamp: "2025-01-28T10:00:00+09:00",
      spots: [{ name: "ロープウェイ山麓駅", status: "空いています" }],
    };

    await expect(saveStatusSnapshot(mockDb, data)).resolves.toBeUndefined();

    expect(mockDb.prepare).toHaveBeenCalledWith(
      "INSERT INTO status_snapshots (timestamp, spots) VALUES (?, ?)",
    );
  });

  it("DBエラー時に適切なエラーメッセージをスローする", async () => {
    const mockDb = createMockDb({
      runError: new Error("DB connection failed"),
    });
    const data: SidebarData = {
      timestamp: "2025-01-28T10:00:00+09:00",
      spots: [],
    };

    await expect(saveStatusSnapshot(mockDb, data)).rejects.toThrow(
      "Failed to save snapshot at 2025-01-28T10:00:00+09:00: DB connection failed",
    );
  });
});

describe("getStatusData", () => {
  it("空の結果を正しく処理する", async () => {
    const mockDb = createMockDb({ allResult: { results: [] } });

    const result = await getStatusData(mockDb);

    expect(result).toEqual([]);
    expect(mockDb.prepare).toHaveBeenCalledWith(
      "SELECT id, timestamp, spots FROM status_snapshots ORDER BY timestamp DESC LIMIT ?",
    );
  });

  it("取得したデータをgroupSnapshotsByDateで変換する", async () => {
    const mockDb = createMockDb({
      allResult: {
        results: [
          {
            id: 1,
            timestamp: "2025-01-28T10:00:00+09:00",
            spots: JSON.stringify([
              { name: "ロープウェイ山麓駅", status: "空いています" },
            ]),
          },
        ],
      },
    });

    const result = await getStatusData(mockDb);

    expect(result).toHaveLength(1);
    expect(result[0].date).toBe("2025-01-28");
  });

  it("resultsがundefinedの場合は空配列として処理する", async () => {
    const mockDb = createMockDb({
      allResult: { results: undefined as unknown as unknown[] },
    });

    const result = await getStatusData(mockDb);

    expect(result).toEqual([]);
  });

  it("DBエラー時に適切なエラーメッセージをスローする", async () => {
    const mockDb = createMockDb({ allError: new Error("Query failed") });

    await expect(getStatusData(mockDb)).rejects.toThrow(
      "Failed to fetch status data: Query failed",
    );
  });
});
