export const TARGET_SPOTS = [
  'ロープウェイ山麓駅',
  'ロープウェイ山頂駅',
  '屋上展望台',
  '八幡坂',
] as const;

export const HOURS = Array.from({ length: 13 }, (_, i) => i + 10); // [10, 11, ..., 22]
