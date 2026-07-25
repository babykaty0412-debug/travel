/** 天燈許願牆：放天燈、複選提示詞、🎲 隨機、單盞刪除、一鍵清空（localStorage 保存） */
import type { Trip, WishEntry } from './types';
import { must, store, esc } from './util';
import { confetti, flyLantern, toast } from './fx';

const MAX = 40;

export function initWish(w: Trip['wish']): void {
  const wall = must('#wishWall');
  const input = must<HTMLInputElement>('#wishText');
  const who = must<HTMLInputElement>('#wishWho');
  const btn = must<HTMLButtonElement>('#wishBtn');
  const sugWrap = must('#wishSuggests');

  let wishes = store.get<WishEntry[]>('wishesv1', []);
  const save = (): void => store.set('wishesv1', wishes.slice(0, MAX));

  function renderWall(): void {
    wall.innerHTML = '';
    if (wishes.length === 0) {
      wall.innerHTML = '<p class="wish-empty">還沒有天燈，來放第一盞吧 🏮</p>';
      return;
    }

    const head = document.createElement('div');
    head.className = 'wall-head';
    head.innerHTML = `<span class="wall-count">🏮 已放 ${wishes.length} 盞</span>`;
    const clear = document.createElement('button');
    clear.type = 'button';
    clear.className = 'wall-clear';
    clear.textContent = '🗑 清空';
    clear.addEventListener('click', () => {
      if (confirm(`確定要清空全部 ${wishes.length} 盞天燈願望嗎？此動作無法復原。`)) {
        wishes = [];
        save();
        renderWall();
        toast('許願牆已清空 🏮');
      }
    });
    head.append(clear);
    wall.append(head);

    const chips = document.createElement('div');
    chips.className = 'wall-chips';
    wishes.slice(0, MAX).forEach((wish, idx) => {
      const chip = document.createElement('span');
      chip.className = 'wish-chip';
      chip.innerHTML =
        `🏮 <span class="t">${esc(wish.text)}</span>` +
        (wish.who ? ` <span class="w">— ${esc(wish.who)}</span>` : '');
      const x = document.createElement('button');
      x.type = 'button';
      x.className = 'wish-x';
      x.setAttribute('aria-label', '移除這盞天燈');
      x.textContent = '✕';
      x.addEventListener('click', () => {
        wishes.splice(idx, 1);
        save();
        renderWall();
      });
      chip.append(x);
      chips.append(chip);
    });
    wall.append(chips);
  }

  const syncChips = (): void => {
    const v = input.value;
    [...sugWrap.children].forEach((b) => {
      const phrase = (b as HTMLElement).dataset.phrase;
      b.classList.toggle('active', Boolean(phrase) && v.includes(phrase!));
    });
  };

  function release(): void {
    const text = input.value.trim();
    if (!text) {
      input.focus();
      toast('先寫下願望再放天燈 🙂');
      return;
    }
    wishes.unshift({ text, who: who.value.trim(), at: Date.now() });
    save();
    renderWall();
    flyLantern(text);
    confetti();
    toast('天燈升空，願望成真 🏮✨');
    input.value = '';
    syncChips();
  }

  btn.addEventListener('click', release);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') release();
  });
  input.addEventListener('input', syncChips);

  // 提示詞（可複選）
  w.suggests.forEach((phrase) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'sug';
    b.textContent = phrase;
    b.dataset.phrase = phrase;
    b.addEventListener('click', () => {
      const v = input.value.trim();
      input.value = v.includes(phrase)
        ? v
            .split('、')
            .filter((x) => x && x !== phrase)
            .join('、')
        : v
          ? `${v}、${phrase}`
          : phrase;
      syncChips();
      input.focus();
    });
    sugWrap.append(b);
  });

  // 🎲 隨機（避開已選）
  const pool = [...w.suggests, ...w.pool];
  const dice = document.createElement('button');
  dice.type = 'button';
  dice.className = 'sug dice';
  dice.textContent = '🎲 隨機';
  dice.addEventListener('click', () => {
    const cur = input.value.trim();
    const avail = pool.filter((p) => !cur.includes(p));
    const arr = avail.length ? avail : pool;
    const pick = arr[Math.floor(Math.random() * arr.length)];
    input.value = cur ? `${cur}、${pick}` : pick;
    syncChips();
    input.focus();
  });
  sugWrap.prepend(dice);

  renderWall();
}
