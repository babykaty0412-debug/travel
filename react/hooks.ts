import { useEffect, useState } from 'react';

/** localStorage 綁定的 state（含隱私模式的 try/catch 保護） */
export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw == null ? initial : (JSON.parse(raw) as T);
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* ignore */
    }
  }, [key, value]);
  return [value, setValue] as const;
}

/** 深淺色主題：偏好記憶 + 套用 data-theme */
export function useTheme() {
  const prefersDark = () => window.matchMedia?.('(prefers-color-scheme:dark)').matches ?? false;
  const [theme, setTheme] = useState<'dark' | 'light' | ''>(() => {
    try {
      return (localStorage.getItem('theme') as 'dark' | 'light' | null) ?? '';
    } catch {
      return '';
    }
  });
  const isDark = theme ? theme === 'dark' : prefersDark();
  useEffect(() => {
    if (!theme) return;
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('theme', theme);
    } catch {
      /* ignore */
    }
  }, [theme]);
  return { isDark, toggle: () => setTheme(isDark ? 'light' : 'dark') };
}

/** 滑動高亮：回傳目前在視窗中的區塊 id */
export function useScrollSpy(ids: string[]): string {
  const [active, setActive] = useState('');
  const key = ids.join('|');
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 },
    );
    for (const id of key.split('|')) {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    }
    return () => obs.disconnect();
  }, [key]);
  return active;
}
