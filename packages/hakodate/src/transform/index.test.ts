import { describe, it, expect } from "vitest";
import { groupSnapshotsByDate } from "./index";
import type { StatusSnapshot } from "../types";

describe("groupSnapshotsByDate", () => {
  it("空配列を渡すと空配列を返す", () => {
    const result = groupSnapshotsByDate([]);
    expect(result).toEqual([]);
  });

  it("単一のスナップショットを正しくグループ化する", () => {
    const rows: StatusSnapshot[] = [
      {
        id: 1,
        timestamp: "2025-01-28T10:00:00+09:00",
        spots: JSON.stringify([
          { name: "ロープウェイ山麓駅", status: "空いています" },
          { name: "ロープウェイ山頂駅", status: "やや混雑" },
        ]),
      },
    ];

    const result = groupSnapshotsByDate(rows);

    expect(result).toHaveLength(1);
    expect(result[0].date).toBe("2025-01-28");
    expect(result[0].dataByHour[10]).toEqual({
      ロープウェイ山麓駅: "空いています",
      ロープウェイ山頂駅: "やや混雑",
    });
  });

  it("複数日のスナップショットを日付降順でソートする", () => {
    const rows: StatusSnapshot[] = [
      {
        id: 1,
        timestamp: "2025-01-27T10:00:00+09:00",
        spots: JSON.stringify([
          { name: "ロープウェイ山麓駅", status: "空いています" },
        ]),
      },
      {
        id: 2,
        timestamp: "2025-01-28T10:00:00+09:00",
        spots: JSON.stringify([{ name: "ロープウェイ山麓駅", status: "混雑" }]),
      },
    ];

    const result = groupSnapshotsByDate(rows);

    expect(result).toHaveLength(2);
    expect(result[0].date).toBe("2025-01-28");
    expect(result[1].date).toBe("2025-01-27");
  });

  it("同じ日の複数時間のデータを正しくグループ化する", () => {
    const rows: StatusSnapshot[] = [
      {
        id: 1,
        timestamp: "2025-01-28T10:00:00+09:00",
        spots: JSON.stringify([
          { name: "ロープウェイ山麓駅", status: "空いています" },
        ]),
      },
      {
        id: 2,
        timestamp: "2025-01-28T14:00:00+09:00",
        spots: JSON.stringify([{ name: "ロープウェイ山麓駅", status: "混雑" }]),
      },
    ];

    const result = groupSnapshotsByDate(rows);

    expect(result).toHaveLength(1);
    expect(result[0].dataByHour[10]).toEqual({
      ロープウェイ山麓駅: "空いています",
    });
    expect(result[0].dataByHour[14]).toEqual({ ロープウェイ山麓駅: "混雑" });
  });

  it("不正なJSONを含む行はスキップする", () => {
    const rows: StatusSnapshot[] = [
      {
        id: 1,
        timestamp: "2025-01-28T10:00:00+09:00",
        spots: "invalid json",
      },
      {
        id: 2,
        timestamp: "2025-01-28T11:00:00+09:00",
        spots: JSON.stringify([
          { name: "ロープウェイ山麓駅", status: "空いています" },
        ]),
      },
    ];

    const result = groupSnapshotsByDate(rows);

    expect(result).toHaveLength(1);
    expect(result[0].dataByHour[11]).toBeDefined();
    expect(result[0].dataByHour[10]).toBeUndefined();
  });

  it("不正なタイムスタンプ形式の行はスキップする", () => {
    const rows: StatusSnapshot[] = [
      {
        id: 1,
        timestamp: "invalid-timestamp",
        spots: JSON.stringify([
          { name: "ロープウェイ山麓駅", status: "空いています" },
        ]),
      },
    ];

    const result = groupSnapshotsByDate(rows);

    expect(result).toEqual([]);
  });

  it("TARGET_SPOTSに含まれないスポットは除外される", () => {
    const rows: StatusSnapshot[] = [
      {
        id: 1,
        timestamp: "2025-01-28T10:00:00+09:00",
        spots: JSON.stringify([
          { name: "ロープウェイ山麓駅", status: "空いています" },
          { name: "未知のスポット", status: "混雑" },
        ]),
      },
    ];

    const result = groupSnapshotsByDate(rows);

    expect(result[0].dataByHour[10]).toEqual({
      ロープウェイ山麓駅: "空いています",
    });
    expect(result[0].dataByHour[10]["未知のスポット"]).toBeUndefined();
  });

  it("同じ時間に複数データがある場合、最初のデータが優先される", () => {
    const rows: StatusSnapshot[] = [
      {
        id: 1,
        timestamp: "2025-01-28T10:00:00+09:00",
        spots: JSON.stringify([
          { name: "ロープウェイ山麓駅", status: "空いています" },
        ]),
      },
      {
        id: 2,
        timestamp: "2025-01-28T10:30:00+09:00",
        spots: JSON.stringify([{ name: "ロープウェイ山麓駅", status: "混雑" }]),
      },
    ];

    const result = groupSnapshotsByDate(rows);

    expect(result[0].dataByHour[10]).toEqual({
      ロープウェイ山麓駅: "空いています",
    });
  });
});
