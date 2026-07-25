import { describe, it, expect } from 'vitest';
import { esc, gmaps } from './util';

describe('esc', () => {
  it('轉義 HTML 特殊字元（防 XSS）', () => {
    expect(esc('<b>"&"</b>')).toBe('&lt;b&gt;&quot;&amp;&quot;&lt;/b&gt;');
  });
});

describe('gmaps', () => {
  it('產生編碼後的 Google 地圖搜尋連結', () => {
    expect(gmaps('十分瀑布')).toBe(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('十分瀑布')}`,
    );
  });
});
