/** 進入點：載入 trip.json → 渲染 → 初始化各模組（互相獨立、單點失敗不影響其他） */
import 'leaflet/dist/leaflet.css';
import './styles.css';
import type { Trip } from './types';
import { must } from './util';
import { buildPage } from './render';
import { currentIsDark, initTheme } from './theme';
import { initMap, type MapController } from './map';
import { initCountdown, initScrollSpy, initBackToTop, initReveal, initPacking } from './ui';
import { initWish } from './wish';

function safe(label: string, fn: () => void): void {
  try {
    fn();
  } catch (e) {
    console.error(`[init] ${label}:`, e);
  }
}

async function main(): Promise<void> {
  const app = must('#app');

  let data: Trip;
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}data/trip.json`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    data = (await res.json()) as Trip;
  } catch {
    app.innerHTML =
      '<p class="maphint" style="padding:40px 0;text-align:center;font-size:14px">行程載入失敗，請確認網路後重新整理 🔄</p>';
    return;
  }

  app.innerHTML = buildPage(data);

  let mapCtl: MapController | undefined;
  safe('map', () => {
    mapCtl = initMap(data, currentIsDark());
  });
  safe('theme', () => initTheme((dark) => mapCtl?.setTheme(dark)));
  safe('countdown', () => initCountdown(data.meta.trip));
  safe('scrollspy', initScrollSpy);
  safe('backToTop', initBackToTop);
  safe('reveal', initReveal);
  safe('packing', () => initPacking(data.packing));
  safe('wish', () => initWish(data.wish));

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {
        /* SW 註冊失敗不影響網站 */
      });
    });
  }
}

void main();
