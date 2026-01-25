const KNOWN_STATUSES = new Set([
  '空いています', '待ち時間なし', 'やや混雑', '混雑', '大混雑',
  '通行止め中', 'ライトアップ中', '営業中', '利用可能',
]);

export function getStatusClass(status: string): string {
  if (status == null || typeof status !== 'string') return '';
  if (status.includes('分待ち')) return 'status-wait';
  const normalized = status.replace(/\s/g, '');
  return KNOWN_STATUSES.has(normalized) ? `status-${normalized}` : '';
}

export function extractHour(filename: string): number {
  return parseInt(filename.replace('.json', '').split('-')[0], 10);
}
