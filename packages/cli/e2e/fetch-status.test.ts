import { describe, it, expect } from 'vitest';
import { fetchStatus } from '../src/fetch-status.ts';

describe('fetchStatus', () => {
  it('vacan.comから混雑状況を取得できる', async () => {
    const logs: string[] = [];
    const warnings: string[] = [];

    const result = await fetchStatus({
      onLog: (msg) => logs.push(msg),
      onWarn: (msg) => warnings.push(msg),
    });

    // 基本構造の検証
    expect(result).toHaveProperty('timestamp');
    expect(result).toHaveProperty('spots');
    expect(Array.isArray(result.spots)).toBe(true);

    // タイムスタンプがISO形式であること
    expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+09:00$/);

    // 少なくとも1件以上のスポットがあること
    expect(result.spots.length).toBeGreaterThan(0);

    // 各スポットの構造を検証
    for (const spot of result.spots) {
      expect(spot).toHaveProperty('name');
      expect(spot).toHaveProperty('status');
      expect(typeof spot.name).toBe('string');
      expect(typeof spot.status).toBe('string');
      expect(spot.name.length).toBeGreaterThan(0);
      expect(spot.status.length).toBeGreaterThan(0);
    }

    // ログが出力されていること
    expect(logs.some((log) => log.includes('Navigating'))).toBe(true);
    expect(logs.some((log) => log.includes('Waiting'))).toBe(true);
  }, 30000);

  it('ロープウェイ山頂駅が含まれている', async () => {
    const result = await fetchStatus();

    const ropeway = result.spots.find((s) => s.name.includes('ロープウェイ山頂駅'));
    expect(ropeway).toBeDefined();
    expect(ropeway?.status).toBeTruthy();
  }, 30000);

  it('ステータスに改行や余分な空白が含まれていない', async () => {
    const result = await fetchStatus();

    for (const spot of result.spots) {
      expect(spot.status).not.toMatch(/\s/);
    }
  }, 30000);
});
