/** 由 Trip 資料產生各區塊 HTML（純函式，無副作用） */
import type { Trip, Day, Stop, Stay, FoodCard } from './types';
import { gmaps } from './util';

const extLink = (href: string, cls: string, label: string): string =>
  `<a class="${cls}" target="_blank" rel="noopener" href="${href}">${label}</a>`;

const heroHTML = (m: Trip['meta']): string => `
  <header class="hero reveal">
    <span class="lantern l1"></span><span class="lantern l2"></span><span class="lantern l3"></span>
    <p class="eyebrow">${m.eyebrow}</p>
    <h1>${m.heading}</h1>
    <p class="sub">${m.sub}</p>
    <div class="meta-row">${m.chips.map((c) => `<span class="chip">${c}</span>`).join('')}</div>
    <div class="countdown" id="countdown"></div>
  </header>`;

const navHTML = (days: Day[]): string => {
  const items = [
    { id: 'map-sec', label: '地圖' },
    { id: 'stays', label: '住宿' },
    ...days.map((d) => ({ id: d.id, label: d.tag })),
    { id: 'food', label: '美食' },
    { id: 'pack', label: '打包' },
    { id: 'tips', label: '提醒' },
    { id: 'wish', label: '許願' },
  ];
  return `<nav aria-label="快速跳轉"><div class="nav-inner" id="navInner">${items
    .map((n) => `<a href="#${n.id}">${n.label}</a>`)
    .join('')}</div></nav>`;
};

const mapHTML = (map: Trip['map']): string => `
  <section id="map-sec" class="reveal">
    <h2 class="sec-title">🗺️ 行程地圖</h2>
    <div id="map"></div>
    <div class="legend">${map.legend.map((l) => `<span>${l}</span>`).join('')}</div>
    <p class="maphint">${map.hint}</p>
  </section>`;

const stayHTML = (s: Stay): string => `
  <div class="stay">
    <div class="night">${s.night}</div>
    <p class="name">${s.name}</p>
    <p class="addr">${s.addr}</p>
    <p class="feat">${s.feat}</p>
    <div class="btnrow">
      ${extLink(gmaps(s.query), 'navbtn', '📍 導航')}
      ${s.tel ? `<a class="navbtn tel" href="tel:${s.tel.replace(/-/g, '')}">☎ ${s.tel}</a>` : ''}
    </div>
  </div>`;

const staysHTML = (stays: Stay[]): string => `
  <section id="stays" class="reveal">
    <h2 class="sec-title">🏨 兩晚住宿</h2>
    <div class="stays">${stays.map(stayHTML).join('')}</div>
  </section>`;

const stopHTML = (stop: Stop, dayColor: string): string => {
  const color = stop.color ?? dayColor ?? '';
  const cardCls = ['card', stop.highlight && 'hl', stop.opt && 'opt'].filter(Boolean).join(' ');
  const badge = stop.badge ? ` <span class="badge">${stop.badge}</span>` : '';
  const drive = stop.drive ? `<p class="drive">${stop.drive}</p>` : '';
  const bullets = stop.bullets?.length
    ? `<ul>${stop.bullets.map((b) => `<li>${b}</li>`).join('')}</ul>`
    : '';
  const nav = stop.query ? extLink(gmaps(stop.query), 'mini-nav', '導航 ↗') : '';
  return `<div class="stop ${color}"><span class="time tnum">${stop.time}</span><div class="${cardCls}"><p class="h">${stop.title}${badge}</p>${drive}${bullets}${nav}</div></div>`;
};

const dayHTML = (d: Day): string => `
  <section id="${d.id}" class="reveal">
    <div class="day-head"><span class="day-tag ${d.color}">${d.tag}</span><span class="day-date">${d.date}</span></div>
    <p class="day-title">${d.title}</p>
    <div class="timeline">${d.stops.map((s) => stopHTML(s, d.color)).join('')}</div>
  </section>`;

const foodCardHTML = (c: FoodCard): string => `
  <div class="subcard ${c.green ? 'green' : ''}">
    <p class="who">${c.title}</p>
    <ul>${c.items.map((i) => `<li>${i}</li>`).join('')}</ul>
    ${
      c.navs?.length
        ? `<div class="chips-nav">${c.navs.map((n) => extLink(gmaps(n.query), 'mini-nav', n.label)).join('')}</div>`
        : ''
    }
    ${c.note ? `<p class="subcard-note">${c.note}</p>` : ''}
  </div>`;

const foodHTML = (food: Trip['food']): string => `
  <section id="food" class="reveal">
    <h2 class="sec-title">🍜 老街美食名店</h2>
    <div class="block foodblock">
      ${food.cards.map(foodCardHTML).join('')}
      <p class="food-note">${food.note}</p>
    </div>
  </section>`;

const packHTML = (): string => `
  <section id="pack" class="reveal">
    <h2 class="sec-title">🎒 打包清單</h2>
    <div class="block">
      <div class="ck-head"><span class="ck-count" id="ckCount">0 / 0</span><button class="ck-reset" id="ckReset">清除勾選</button></div>
      <ul class="checklist" id="checklist"></ul>
      <p class="pack-note">✅ 勾選會自動記住（存在這支手機的瀏覽器裡），下次打開還在。</p>
    </div>
  </section>`;

const tipListHTML = (items: Trip['rainy']['items']): string =>
  `<ul class="tips">${items
    .map((t) => `<li><span class="ic">${t.ic}</span><span>${t.html}</span></li>`)
    .join('')}</ul>`;

const tipsHTML = (data: Trip): string => `
  <section id="tips" class="reveal">
    <h2 class="sec-title">${data.tipsHeading}</h2>
    <div class="block block-mb">
      <p class="block-title">${data.rainy.title}</p>
      ${tipListHTML(data.rainy.items)}
    </div>
    <div class="block">
      <p class="block-title">${data.drive.title}</p>
      ${tipListHTML(data.drive.items)}
      <table class="drv tnum drv-mt"><tbody>${data.drive.table
        .map((r) => `<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`)
        .join('')}</tbody></table>
    </div>
  </section>`;

const wishHTML = (w: Trip['wish']): string => `
  <section id="wish" class="reveal">
    <h2 class="sec-title">🏮 天燈許願牆</h2>
    <div class="block">
      <p class="wish-intro">${w.intro}</p>
      <div class="wish-form">
        <input id="wishText" maxlength="40" placeholder="${w.placeholder}" aria-label="願望" />
        <input id="wishWho" maxlength="8" placeholder="${w.whoPlaceholder}" aria-label="署名" />
        <button id="wishBtn" type="button">${w.button}</button>
      </div>
      <p class="sug-hint">${w.suggestHint}</p>
      <div class="wish-suggests" id="wishSuggests"></div>
      <div class="wish-wall" id="wishWall"></div>
    </div>
  </section>`;

const footerHTML = (lines: string[]): string =>
  `<footer><div class="flame">🏮</div>${lines.join('<br>')}</footer>`;

export const buildPage = (data: Trip): string =>
  heroHTML(data.meta) +
  navHTML(data.days) +
  mapHTML(data.map) +
  staysHTML(data.stays) +
  data.days.map(dayHTML).join('') +
  foodHTML(data.food) +
  packHTML() +
  tipsHTML(data) +
  wishHTML(data.wish) +
  footerHTML(data.footer);
