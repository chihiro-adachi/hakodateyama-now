export const TARGET_SPOTS = [
  'ロープウェイ山麓駅',
  'ロープウェイ山頂駅',
  '屋上展望台',
  '八幡坂',
] as const;

export const SHORT_NAMES: Record<string, string> = {
  'ロープウェイ山麓駅': '山麓駅',
  'ロープウェイ山頂駅': '山頂駅',
  '屋上展望台': '展望台',
  '八幡坂': '八幡坂',
};

export const HOURS = Array.from({ length: 13 }, (_, i) => i + 10); // [10, 11, ..., 22]
