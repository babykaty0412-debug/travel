/** 視覺特效：toast、煙火、放天燈（打包與許願牆共用） */
import { esc, prefersReduced } from './util';

let toastEl: HTMLDivElement | null = null;
let toastTimer: number | undefined;

export function toast(msg: string): void {
  if (!toastEl) {
    toastEl = document.createElement('div');
    toastEl.className = 'toast';
    document.body.append(toastEl);
  }
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toastEl?.classList.remove('show'), 2600);
}

export function confetti(): void {
  if (prefersReduced) return;
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
}

export function flyLantern(text: string): void {
  if (prefersReduced) return;
  const el = document.createElement('div');
  el.className = 'fly';
  el.style.setProperty('--dx', `${(Math.random() * 160 - 80).toFixed(0)}px`);
  el.style.animationDuration = `${(6 + Math.random() * 2).toFixed(2)}s`;
  el.innerHTML = `<div class="fly-body"></div><div class="fly-wish">${esc(text)}</div>`;
  document.body.append(el);
  el.addEventListener('animationend', () => el.remove());
}
