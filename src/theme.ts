/** 深淺色主題：儲存偏好 + View Transitions 圓形擴散過場 */
import { must, prefersReduced } from './util';

const mql = (q: string): boolean => window.matchMedia?.(q).matches ?? false;

export function currentIsDark(): boolean {
  let saved: string | null = null;
  try {
    saved = localStorage.getItem('theme');
  } catch {
    /* ignore */
  }
  if (saved) return saved === 'dark';
  return mql('(prefers-color-scheme:dark)');
}

type ViewTransitionDoc = Document & {
  startViewTransition?: (cb: () => void) => { ready: Promise<void> };
};

/** onChange 會在初始與每次切換時收到目前是否為深色 */
export function initTheme(onChange: (dark: boolean) => void): void {
  const root = document.documentElement;
  const btn = must<HTMLButtonElement>('#themeBtn');

  const paint = (): void => {
    btn.textContent = currentIsDark() ? '☀️' : '🌙';
  };

  // 套用已儲存偏好（首次載入）
  try {
    const saved = localStorage.getItem('theme');
    if (saved) root.setAttribute('data-theme', saved);
  } catch {
    /* ignore */
  }
  paint();

  btn.addEventListener('click', (e) => {
    const next = currentIsDark() ? 'light' : 'dark';
    const apply = (): void => {
      root.setAttribute('data-theme', next);
      try {
        localStorage.setItem('theme', next);
      } catch {
        /* ignore */
      }
      paint();
      onChange(next === 'dark');
    };

    const doc = document as ViewTransitionDoc;
    if (doc.startViewTransition && !prefersReduced) {
      const x = e.clientX || window.innerWidth - 28;
      const y = e.clientY || 28;
      const radius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y),
      );
      const transition = doc.startViewTransition(apply);
      transition.ready
        .then(() => {
          root.animate(
            {
              clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`],
            },
            { duration: 480, easing: 'ease-in-out', pseudoElement: '::view-transition-new(root)' },
          );
        })
        .catch(() => {
          /* 不支援時忽略 */
        });
    } else {
      apply();
    }
  });
}
