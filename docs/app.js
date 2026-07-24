/* 平溪 × 深坑 行程網站 — 資料驅動渲染 + 互動
   資料唯一來源：data/trip.json　樣式：styles.css */
(() => {
  'use strict';

  /* ================= 小工具 ================= */
  const $ = (sel, root = document) => root.querySelector(sel);
  const gmaps = q => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const store = {
    get(key, fallback) { try { const v = localStorage.getItem(key); return v == null ? fallback : JSON.parse(v); } catch { return fallback; } },
    set(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch { /* 隱私模式等情況忽略 */ } },
  };
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion:reduce)').matches;

  /* ================= 視覺特效（許願牆 & 打包共用） ================= */
  const fx = {
    _toast: null,
    toast(msg) {
      if (!this._toast) { this._toast = document.createElement('div'); this._toast.className = 'toast'; document.body.append(this._toast); }
      this._toast.textContent = msg;
      this._toast.classList.add('show');
      clearTimeout(this._timer);
      this._timer = setTimeout(() => this._toast.classList.remove('show'), 2600);
    },
    confetti() {
      if (reduceMotion) return;
      const emojis = ['🏮', '✨', '🎉', '🏮', '⭐'];
      for (let i = 0; i < 16; i++) {
        const s = document.createElement('div');
        s.className = 'cfx';
        s.textContent = emojis[i % emojis.length];
        s.style.left = `${Math.random() * 100}vw`;
        s.style.animationDuration = `${(2.4 + Math.random() * 1.8).toFixed(2)}s`;
        s.style.animationDelay = `${(Math.random() * 0.5).toFixed(2)}s`;
        document.body.append(s);
        s.addEventListener('animationend', () => s.remove());
      }
    },
    flyLantern(text) {
      if (reduceMotion) return;
      const el = document.createElement('div');
      el.className = 'fly';
      el.style.setProperty('--dx', `${(Math.random() * 160 - 80).toFixed(0)}px`);
      el.style.animationDuration = `${(6 + Math.random() * 2).toFixed(2)}s`;
      el.innerHTML = `<div class="fly-body"></div><div class="fly-wish">${esc(text)}</div>`;
      document.body.append(el);
      el.addEventListener('animationend', () => el.remove());
    },
  };

  /* ================= 由資料渲染 HTML ================= */
  const navLink = q => gmaps(q);

  const heroHTML = m => `
    <header class="hero">
      <span class="lantern l1"></span><span class="lantern l2"></span><span class="lantern l3"></span>
      <p class="eyebrow">${m.eyebrow}</p>
      <h1>${m.heading}</h1>
      <p class="sub">${m.sub}</p>
      <div class="meta-row">${m.chips.map(c => `<span class="chip">${c}</span>`).join('')}</div>
      <div class="countdown" id="countdown"></div>
    </header>`;

  const navHTML = days => {
    const items = [
      { id: 'map-sec', label: '地圖' },
      { id: 'stays', label: '住宿' },
      ...days.map(d => ({ id: d.id, label: d.tag })),
      { id: 'food', label: '美食' },
      { id: 'pack', label: '打包' },
      { id: 'tips', label: '提醒' },
      { id: 'wish', label: '許願' },
    ];
    return `<nav aria-label="快速跳轉"><div class="nav-inner" id="navInner">${
      items.map(n => `<a href="#${n.id}">${n.label}</a>`).join('')
    }</div></nav>`;
  };

  const mapHTML = map => `
    <section id="map-sec">
      <h2 class="sec-title">🗺️ 行程地圖</h2>
      <div id="map"></div>
      <div class="legend">${map.legend.map(l => `<span>${l}</span>`).join('')}</div>
      <p class="maphint">${map.hint}</p>
    </section>`;

  const stayHTML = s => `
    <div class="stay">
      <div class="night">${s.night}</div>
      <p class="name">${s.name}</p>
      <p class="addr">${s.addr}</p>
      <p class="feat">${s.feat}</p>
      <div class="btnrow">
        <a class="navbtn" target="_blank" rel="noopener" href="${navLink(s.query)}">📍 導航</a>
        ${s.tel ? `<a class="navbtn tel" href="tel:${s.tel.replace(/-/g, '')}">☎ ${s.tel}</a>` : ''}
      </div>
    </div>`;

  const staysHTML = stays => `
    <section id="stays">
      <h2 class="sec-title">🏨 兩晚住宿</h2>
      <div class="stays">${stays.map(stayHTML).join('')}</div>
    </section>`;

  const stopHTML = (stop, dayColor) => {
    const color = stop.color || dayColor || '';
    const cardCls = ['card', stop.highlight && 'hl', stop.opt && 'opt'].filter(Boolean).join(' ');
    const badge = stop.badge ? ` <span class="badge">${stop.badge}</span>` : '';
    const drive = stop.drive ? `<p class="drive">${stop.drive}</p>` : '';
    const bullets = stop.bullets?.length ? `<ul>${stop.bullets.map(b => `<li>${b}</li>`).join('')}</ul>` : '';
    const nav = stop.query ? `<a class="mini-nav" target="_blank" rel="noopener" href="${navLink(stop.query)}">導航 ↗</a>` : '';
    return `<div class="stop ${color}"><span class="time tnum">${stop.time}</span>` +
      `<div class="${cardCls}"><p class="h">${stop.title}${badge}</p>${drive}${bullets}${nav}</div></div>`;
  };

  const dayHTML = d => `
    <section id="${d.id}">
      <div class="day-head"><span class="day-tag ${d.color || ''}">${d.tag}</span><span class="day-date">${d.date}</span></div>
      <p class="day-title">${d.title}</p>
      <div class="timeline">${d.stops.map(s => stopHTML(s, d.color)).join('')}</div>
    </section>`;

  const foodCardHTML = c => `
    <div class="subcard ${c.green ? 'green' : ''}">
      <p class="who">${c.title}</p>
      <ul>${c.items.map(i => `<li>${i}</li>`).join('')}</ul>
      ${c.navs?.length ? `<div class="chips-nav">${c.navs.map(n => `<a class="mini-nav" target="_blank" rel="noopener" href="${navLink(n.query)}">${n.label}</a>`).join('')}</div>` : ''}
      ${c.note ? `<p class="subcard-note">${c.note}</p>` : ''}
    </div>`;

  const foodHTML = food => `
    <section id="food">
      <h2 class="sec-title">🍜 老街美食名店</h2>
      <div class="block foodblock">
        ${food.cards.map(foodCardHTML).join('')}
        <p class="food-note">${food.note}</p>
      </div>
    </section>`;

  const packHTML = () => `
    <section id="pack">
      <h2 class="sec-title">🎒 打包清單</h2>
      <div class="block">
        <div class="ck-head"><span class="ck-count" id="ckCount">0 / 0</span><button class="ck-reset" id="ckReset">清除勾選</button></div>
        <ul class="checklist" id="checklist"></ul>
        <p class="pack-note">✅ 勾選會自動記住（存在這支手機的瀏覽器裡），下次打開還在。</p>
      </div>
    </section>`;

  const tipListHTML = items => `<ul class="tips">${
    items.map(t => `<li><span class="ic">${t.ic}</span><span>${t.html}</span></li>`).join('')
  }</ul>`;

  const tipsHTML = data => `
    <section id="tips">
      <h2 class="sec-title">${data.tipsHeading}</h2>
      <div class="block block-mb">
        <p class="block-title">${data.rainy.title}</p>
        ${tipListHTML(data.rainy.items)}
      </div>
      <div class="block">
        <p class="block-title">${data.drive.title}</p>
        ${tipListHTML(data.drive.items)}
        <table class="drv tnum drv-mt"><tbody>${
          data.drive.table.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join('')
        }</tbody></table>
      </div>
    </section>`;

  const wishHTML = w => `
    <section id="wish">
      <h2 class="sec-title">🏮 天燈許願牆</h2>
      <div class="block">
        <p class="wish-intro">${w.intro}</p>
        <div class="wish-form">
          <input id="wishText" maxlength="40" placeholder="${w.placeholder}" aria-label="願望">
          <input id="wishWho" maxlength="8" placeholder="${w.whoPlaceholder}" aria-label="署名">
          <button id="wishBtn" type="button">${w.button}</button>
        </div>
        <p class="sug-hint">${w.suggestHint}</p>
        <div class="wish-suggests" id="wishSuggests"></div>
        <div class="wish-wall" id="wishWall"></div>
      </div>
    </section>`;

  const footerHTML = lines => `<footer><div class="flame">🏮</div>${lines.join('<br>')}</footer>`;

  const buildPage = data => heroHTML(data.meta) + navHTML(data.days) + mapHTML(data.map) +
    staysHTML(data.stays) + data.days.map(dayHTML).join('') + foodHTML(data.food) +
    packHTML() + tipsHTML(data) + wishHTML(data.wish) + footerHTML(data.footer);

  /* ================= 互動模組 ================= */
  function initTheme() {
    const root = document.documentElement;
    const btn = $('#themeBtn');
    let saved = null;
    try { saved = localStorage.getItem('theme'); } catch { /* ignore */ }
    const prefersDark = () => window.matchMedia?.('(prefers-color-scheme:dark)').matches;
    const isDark = () => { const t = root.getAttribute('data-theme'); return t ? t === 'dark' : prefersDark(); };
    const paint = () => { btn.textContent = isDark() ? '☀️' : '🌙'; };
    if (saved) root.setAttribute('data-theme', saved);
    paint();
    btn.addEventListener('click', () => {
      const next = isDark() ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch { /* ignore */ }
      paint();
    });
  }

  function initCountdown(trip) {
    const el = $('#countdown');
    if (!el) return;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const start = new Date(`${trip.start}T00:00:00`);
    const end = new Date(`${trip.end}T00:00:00`);
    const DAY = 86400000;
    if (today < start) {
      const d = Math.round((start - today) / DAY);
      el.textContent = d === 1 ? '🚗 明天就出發！' : `🚗 距離出發還有 ${d} 天`;
    } else if (today <= end) {
      const n = Math.floor((today - start) / DAY) + 1;
      const total = Math.round((end - start) / DAY) + 1;
      el.textContent = `🏮 旅程進行中 · 今天是 Day ${n} / ${total}`;
    } else {
      el.textContent = '🎉 旅程圓滿結束，期待下次出遊！';
    }
  }

  function initMap(data) {
    const { dayColors, dayEmoji } = data;
    const map = L.map('map', { scrollWheelZoom: false });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap' }).addTo(map);

    const markers = data.map.places.map(p => {
      const color = dayColors[p.day];
      const emoji = p.hotel ? '🏨' : (dayEmoji[p.day] || '📍');
      const icon = L.divIcon({
        className: '', iconSize: [28, 28], iconAnchor: [14, 28], popupAnchor: [0, -26],
        html: `<div class="pin" style="background:${color}"><span>${emoji}</span></div>`,
      });
      const popup = `<div class="pop-h">${esc(p.name)}</div><div class="pop-d">${esc(p.desc)}</div>` +
        `<a class="pop-nav" target="_blank" rel="noopener" href="${gmaps(p.query)}">🧭 Google 導航</a>`;
      return L.marker([p.lat, p.lng], { icon }).addTo(map).bindPopup(popup);
    });

    Object.keys(dayColors).forEach(day => {
      const pts = data.map.places.filter(p => String(p.day) === String(day)).map(p => [p.lat, p.lng]);
      if (pts.length > 1) L.polyline(pts, { color: dayColors[day], weight: 2, opacity: 0.5, dashArray: '5,7' }).addTo(map);
    });

    map.fitBounds(L.featureGroup(markers).getBounds().pad(0.18));
  }

  function initScrollSpy() {
    if (!('IntersectionObserver' in window)) return;
    const links = [...document.querySelectorAll('#navInner a')];
    const byId = Object.fromEntries(links.map(a => [a.getAttribute('href').slice(1), a]));
    const sections = links.map(a => document.getElementById(a.getAttribute('href').slice(1))).filter(Boolean);
    const spy = new IntersectionObserver(entries => {
      entries.forEach(en => {
        const link = byId[en.target.id];
        if (!link) return;
        if (en.isIntersecting) {
          links.forEach(l => { l.classList.remove('active'); l.removeAttribute('aria-current'); });
          link.classList.add('active');
          link.setAttribute('aria-current', 'true');
          link.scrollIntoView({ block: 'nearest', inline: 'center' });
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    sections.forEach(s => spy.observe(s));
  }

  function initBackToTop() {
    const btn = $('#toTop');
    window.addEventListener('scroll', () => btn.classList.toggle('show', window.scrollY > 500), { passive: true });
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  function initPacking(items) {
    const list = $('#checklist');
    const countEl = $('#ckCount');
    let state = store.get('packv1', {}) || {};
    const save = () => store.set('packv1', state);
    const doneCount = () => items.filter((_, i) => state[`i${i}`]).length;
    const updateCount = () => { countEl.textContent = `${doneCount()} / ${items.length}`; };

    items.forEach((text, i) => {
      const li = document.createElement('li');
      const id = `ck${i}`, key = `i${i}`;
      const cb = document.createElement('input');
      cb.type = 'checkbox'; cb.id = id; cb.checked = !!state[key];
      const lb = document.createElement('label');
      lb.htmlFor = id; lb.textContent = text;
      cb.addEventListener('change', () => {
        state[key] = cb.checked; save(); updateCount();
        if (cb.checked && doneCount() === items.length) { fx.confetti(); fx.toast('打包完成，出發囉！🎉'); }
      });
      li.append(cb, lb);
      list.append(li);
    });
    updateCount();

    $('#ckReset').addEventListener('click', () => {
      state = {}; save();
      list.querySelectorAll('input').forEach(cb => { cb.checked = false; });
      updateCount();
    });
  }

  function initWish(w) {
    const wall = $('#wishWall');
    const input = $('#wishText');
    const who = $('#wishWho');
    const btn = $('#wishBtn');
    const sugWrap = $('#wishSuggests');
    let wishes = store.get('wishesv1', []) || [];
    const save = () => store.set('wishesv1', wishes.slice(0, 40));

    function renderWall() {
      wall.innerHTML = '';
      if (!wishes.length) { wall.innerHTML = '<p class="wish-empty">還沒有天燈，來放第一盞吧 🏮</p>'; return; }

      const head = document.createElement('div');
      head.className = 'wall-head';
      head.innerHTML = `<span class="wall-count">🏮 已放 ${wishes.length} 盞</span>`;
      const clear = document.createElement('button');
      clear.type = 'button'; clear.className = 'wall-clear'; clear.textContent = '🗑 清空';
      clear.addEventListener('click', () => {
        if (confirm(`確定要清空全部 ${wishes.length} 盞天燈願望嗎？此動作無法復原。`)) {
          wishes = []; save(); renderWall(); fx.toast('許願牆已清空 🏮');
        }
      });
      head.append(clear);
      wall.append(head);

      const chips = document.createElement('div');
      chips.className = 'wall-chips';
      wishes.slice(0, 40).forEach((wish, idx) => {
        const chip = document.createElement('span');
        chip.className = 'wish-chip';
        chip.innerHTML = `🏮 <span class="t">${esc(wish.text)}</span>` + (wish.who ? ` <span class="w">— ${esc(wish.who)}</span>` : '');
        const x = document.createElement('button');
        x.type = 'button'; x.className = 'wish-x'; x.setAttribute('aria-label', '移除這盞天燈'); x.textContent = '✕';
        x.addEventListener('click', () => { wishes.splice(idx, 1); save(); renderWall(); });
        chip.append(x);
        chips.append(chip);
      });
      wall.append(chips);
    }

    const syncChips = () => {
      const v = input.value;
      [...sugWrap.children].forEach(b => b.classList.toggle('active', !!b.dataset.phrase && v.includes(b.dataset.phrase)));
    };

    function release() {
      const text = input.value.trim();
      if (!text) { input.focus(); fx.toast('先寫下願望再放天燈 🙂'); return; }
      wishes.unshift({ text, who: who.value.trim(), at: Date.now() });
      save(); renderWall(); fx.flyLantern(text); fx.confetti(); fx.toast('天燈升空，願望成真 🏮✨');
      input.value = ''; syncChips();
    }

    btn.addEventListener('click', release);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') release(); });
    input.addEventListener('input', syncChips);

    // 提示詞（可複選）
    w.suggests.forEach(phrase => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'sug'; b.textContent = phrase; b.dataset.phrase = phrase;
      b.addEventListener('click', () => {
        let v = input.value.trim();
        v = v.includes(phrase)
          ? v.split('、').filter(x => x && x !== phrase).join('、')
          : (v ? `${v}、${phrase}` : phrase);
        input.value = v; syncChips(); input.focus();
      });
      sugWrap.append(b);
    });

    // 🎲 隨機（避開已選）
    const pool = [...w.suggests, ...w.pool];
    const dice = document.createElement('button');
    dice.type = 'button'; dice.className = 'sug dice'; dice.textContent = '🎲 隨機';
    dice.addEventListener('click', () => {
      const cur = input.value.trim();
      const avail = pool.filter(p => !cur.includes(p));
      const arr = avail.length ? avail : pool;
      const pick = arr[Math.floor(Math.random() * arr.length)];
      input.value = cur ? `${cur}、${pick}` : pick;
      syncChips(); input.focus();
    });
    sugWrap.prepend(dice);

    renderWall();
  }

  /* ================= 進入點 ================= */
  async function main() {
    const app = $('#app');
    let data;
    try {
      data = await fetch('data/trip.json').then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      });
    } catch {
      app.innerHTML = '<p class="maphint" style="padding:40px 0;text-align:center;font-size:14px">行程載入失敗，請確認網路後重新整理 🔄</p>';
      return;
    }

    app.innerHTML = buildPage(data);

    // 各模組獨立防護：任一失敗（例如地圖圖磚載不到）不影響其他功能
    const safe = (fn, ...args) => { try { fn(...args); } catch (e) { console.error(`[init] ${fn.name}:`, e); } };
    safe(initTheme);
    safe(initCountdown, data.meta.trip);
    safe(initMap, data);
    safe(initScrollSpy);
    safe(initBackToTop);
    safe(initPacking, data.packing);
    safe(initWish, data.wish);
  }

  main();
})();
