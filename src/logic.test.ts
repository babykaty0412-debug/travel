import { describe, it, expect } from 'vitest';
import { countdownLabel, assertTrip } from './logic';

describe('countdownLabel', () => {
  const start = new Date('2026-07-24T00:00:00');
  const end = new Date('2026-07-26T00:00:00');

  it('出發前顯示剩餘天數', () => {
    expect(countdownLabel(new Date('2026-07-20T00:00:00'), start, end)).toBe(
      '🚗 距離出發還有 4 天',
    );
  });

  it('前一天顯示「明天就出發」', () => {
    expect(countdownLabel(new Date('2026-07-23T00:00:00'), start, end)).toBe('🚗 明天就出發！');
  });

  it('旅程中顯示 Day N / total', () => {
    expect(countdownLabel(new Date('2026-07-25T00:00:00'), start, end)).toBe(
      '🏮 旅程進行中 · 今天是 Day 2 / 3',
    );
  });

  it('結束後顯示圓滿結束', () => {
    expect(countdownLabel(new Date('2026-07-27T00:00:00'), start, end)).toContain('圓滿結束');
  });
});

describe('assertTrip', () => {
  it('壞資料會丟出錯誤', () => {
    expect(() => assertTrip({})).toThrow();
    expect(() => assertTrip(null)).toThrow();
    expect(() =>
      assertTrip({ meta: { trip: { start: '2026-07-24', end: '2026-07-26' } } }),
    ).toThrow();
  });
});
