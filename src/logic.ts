/** 純邏輯（無 DOM，方便單元測試）：出發倒數文字 + 執行期資料守衛 */
import type { Trip } from './types';

const DAY_MS = 86_400_000;

/** 依「今天 / 出發日 / 結束日」產生倒數文字 */
export function countdownLabel(today: Date, start: Date, end: Date): string {
  if (today < start) {
    const days = Math.round((+start - +today) / DAY_MS);
    return days === 1 ? '🚗 明天就出發！' : `🚗 距離出發還有 ${days} 天`;
  }
  if (today <= end) {
    const n = Math.floor((+today - +start) / DAY_MS) + 1;
    const total = Math.round((+end - +start) / DAY_MS) + 1;
    return `🏮 旅程進行中 · 今天是 Day ${n} / ${total}`;
  }
  return '🎉 旅程圓滿結束，期待下次出遊！';
}

/** 執行期資料守衛：確認 trip.json 結構正確，壞資料時丟出可讀錯誤而非讓畫面崩潰 */
export function assertTrip(data: unknown): asserts data is Trip {
  const bad = (msg: string): never => {
    throw new Error(`trip.json 格式錯誤：${msg}`);
  };
  if (typeof data !== 'object' || data === null) bad('不是物件');
  const d = data as Record<string, unknown>;

  const meta = d.meta as { trip?: { start?: unknown; end?: unknown } } | undefined;
  if (!meta?.trip || typeof meta.trip.start !== 'string' || typeof meta.trip.end !== 'string') {
    bad('缺少 meta.trip.start / meta.trip.end');
  }
  if (!Array.isArray(d.days) || d.days.length === 0) bad('days 必須是非空陣列');
  if (!d.map || !Array.isArray((d.map as { places?: unknown }).places)) bad('缺少 map.places');
  if (!Array.isArray(d.packing)) bad('packing 必須是陣列');
  if (!d.wish || !Array.isArray((d.wish as { suggests?: unknown }).suggests)) {
    bad('缺少 wish.suggests');
  }
}
