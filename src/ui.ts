/** 週邊互動：出發倒數、滑動高亮導覽、回頂端、捲動揭示、打包清單 */
import { must, store, prefersReduced } from './util';
import { confetti, toast } from './fx';

const DAY_MS = 86_400_000;

export function initCountdown(trip: { start: string; end: string }): void {
  const el = must('#countdown');
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const start = new Date(`${trip.start}T00:00:00`);
  const end = new Date(`${trip.end}T00:00:00`);

  if (today < start) {
    const d = Math.round((+start - +today) / DAY_MS);
    el.textContent = d === 1 ? '🚗 明天就出發！' : `🚗 距離出發還有 ${d} 天`;
  } else if (today <= end) {
    const n = Math.floor((+today - +start) / DAY_MS) + 1;
    const total = Math.round((+end - +start) / DAY_MS) + 1;
    el.textContent = `🏮 旅程進行中 · 今天是 Day ${n} / ${total}`;
  } else {
    el.textContent = '🎉 旅程圓滿結束，期待下次出遊！';
  }
}

export function initScrollSpy(): void {
  if (!('IntersectionObserver' in window)) return;
  const links = [...document.querySelectorAll<HTMLAnchorElement>('#navInner a')];
  const byId = new Map(links.map((a) => [a.getAttribute('href')!.slice(1), a]));
  const sections = links
    .map((a) => document.getElementById(a.getAttribute('href')!.slice(1)))
    .filter((s): s is HTMLElement => s !== null);

  const spy = new IntersectionObserver(
    (entries) => {
      for (const en of entries) {
        const link = byId.get(en.target.id);
        if (!link || !en.isIntersecting) continue;
        links.forEach((l) => {
          l.classList.remove('active');
          l.removeAttribute('aria-current');
        });
        link.classList.add('active');
        link.setAttribute('aria-current', 'true');
        link.scrollIntoView({ block: 'nearest', inline: 'center' });
      }
    },
    { rootMargin: '-45% 0px -50% 0px', threshold: 0 },
  );
  sections.forEach((s) => spy.observe(s));
}

export function initBackToTop(): void {
  const btn = must<HTMLButtonElement>('#toTop');
  window.addEventListener('scroll', () => btn.classList.toggle('show', window.scrollY > 500), {
    passive: true,
  });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/** 捲動時淡入 .reveal 區塊 */
export function initReveal(): void {
  const items = [...document.querySelectorAll<HTMLElement>('.reveal')];
  if (prefersReduced || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('in'));
    return;
  }
  const io = new IntersectionObserver(
    (entries, obs) => {
      for (const en of entries) {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          obs.unobserve(en.target);
        }
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.06 },
  );
  items.forEach((el) => io.observe(el));
}

export function initPacking(items: string[]): void {
  const list = must<HTMLUListElement>('#checklist');
  const countEl = must('#ckCount');
  let state = store.get<Record<string, boolean>>('packv1', {});
  const save = (): void => store.set('packv1', state);
  const done = (): number => items.filter((_, i) => state[`i${i}`]).length;
  const updateCount = (): void => {
    countEl.textContent = `${done()} / ${items.length}`;
  };

  items.forEach((text, i) => {
    const li = document.createElement('li');
    const id = `ck${i}`;
    const key = `i${i}`;
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.id = id;
    cb.checked = Boolean(state[key]);
    const lb = document.createElement('label');
    lb.htmlFor = id;
    lb.textContent = text;
    cb.addEventListener('change', () => {
      state[key] = cb.checked;
      save();
      updateCount();
      if (cb.checked && done() === items.length) {
        confetti();
        toast('打包完成，出發囉！🎉');
      }
    });
    li.append(cb, lb);
    list.append(li);
  });
  updateCount();

  must<HTMLButtonElement>('#ckReset').addEventListener('click', () => {
    state = {};
    save();
    list.querySelectorAll('input').forEach((cb) => {
      (cb as HTMLInputElement).checked = false;
    });
    updateCount();
  });
}
