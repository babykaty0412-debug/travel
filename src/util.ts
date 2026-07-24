/** 共用小工具：DOM 選取、Google 地圖連結、HTML escape、localStorage 封裝 */

export const $ = <T extends Element = HTMLElement>(
  sel: string,
  root: ParentNode = document,
): T | null => root.querySelector<T>(sel);

/** 必定存在的元素（渲染後查詢），回傳非空型別 */
export const must = <T extends Element = HTMLElement>(
  sel: string,
  root: ParentNode = document,
): T => {
  const el = root.querySelector<T>(sel);
  if (!el) throw new Error(`找不到元素：${sel}`);
  return el;
};

export const gmaps = (q: string): string =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;

const ENTITIES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
export const esc = (s: unknown): string => String(s).replace(/[&<>"]/g, (c) => ENTITIES[c]);

export const store = {
  get<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(key);
      return raw == null ? fallback : (JSON.parse(raw) as T);
    } catch {
      return fallback;
    }
  },
  set(key: string, val: unknown): void {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch {
      /* 隱私模式等情況忽略 */
    }
  },
};

export const prefersReduced =
  typeof window !== 'undefined' &&
  (window.matchMedia?.('(prefers-reduced-motion:reduce)').matches ?? false);
