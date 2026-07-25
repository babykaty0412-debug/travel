import { useState } from 'react';
import type { Trip, WishEntry } from '../src/types';
import { useLocalStorage } from './hooks';
import { confetti, flyLantern, toast } from '../src/fx';

const MAX = 40;

/** 天燈許願牆（React 版）。使用者文字由 React 自動 escape，天生防 XSS。 */
export function WishWall({ wish }: { wish: Trip['wish'] }) {
  const [wishes, setWishes] = useLocalStorage<WishEntry[]>('wishesv1', []);
  const [text, setText] = useState('');
  const [who, setWho] = useState('');
  const pool = [...wish.suggests, ...wish.pool];

  const release = (): void => {
    const t = text.trim();
    if (!t) {
      toast('先寫下願望再放天燈 🙂');
      return;
    }
    setWishes([{ text: t, who: who.trim(), at: Date.now() }, ...wishes].slice(0, MAX));
    flyLantern(t);
    confetti();
    toast('天燈升空，願望成真 🏮✨');
    setText('');
  };

  const toggleSuggest = (phrase: string): void => {
    const v = text.trim();
    setText(
      v.includes(phrase)
        ? v
            .split('、')
            .filter((x) => x && x !== phrase)
            .join('、')
        : v
          ? `${v}、${phrase}`
          : phrase,
    );
  };

  const random = (): void => {
    const cur = text.trim();
    const avail = pool.filter((p) => !cur.includes(p));
    const arr = avail.length ? avail : pool;
    const pick = arr[Math.floor(Math.random() * arr.length)];
    setText(cur ? `${cur}、${pick}` : pick);
  };

  const clearAll = (): void => {
    if (confirm(`確定要清空全部 ${wishes.length} 盞天燈願望嗎？此動作無法復原。`)) {
      setWishes([]);
      toast('許願牆已清空 🏮');
    }
  };

  return (
    <section id="wish">
      <h2 className="sec-title">🏮 天燈許願牆</h2>
      <div className="block">
        <p className="wish-intro">{wish.intro}</p>
        <div className="wish-form">
          <input
            id="wishText"
            maxLength={40}
            placeholder={wish.placeholder}
            aria-label="願望"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') release();
            }}
          />
          <input
            id="wishWho"
            maxLength={8}
            placeholder={wish.whoPlaceholder}
            aria-label="署名"
            value={who}
            onChange={(e) => setWho(e.target.value)}
          />
          <button id="wishBtn" type="button" onClick={release}>
            {wish.button}
          </button>
        </div>
        <p className="sug-hint">{wish.suggestHint}</p>
        <div className="wish-suggests" id="wishSuggests">
          <button type="button" className="sug dice" onClick={random}>
            🎲 隨機
          </button>
          {wish.suggests.map((p) => (
            <button
              key={p}
              type="button"
              className={`sug${text.includes(p) ? ' active' : ''}`}
              onClick={() => toggleSuggest(p)}
            >
              {p}
            </button>
          ))}
        </div>
        <div className="wish-wall" id="wishWall">
          {wishes.length === 0 ? (
            <p className="wish-empty">還沒有天燈，來放第一盞吧 🏮</p>
          ) : (
            <>
              <div className="wall-head">
                <span className="wall-count">🏮 已放 {wishes.length} 盞</span>
                <button className="wall-clear" onClick={clearAll}>
                  🗑 清空
                </button>
              </div>
              <div className="wall-chips">
                {wishes.slice(0, MAX).map((w, idx) => (
                  <span className="wish-chip" key={`${w.at}-${idx}`}>
                    🏮 <span className="t">{w.text}</span>
                    {w.who ? (
                      <>
                        {' '}
                        <span className="w">— {w.who}</span>
                      </>
                    ) : null}
                    <button
                      type="button"
                      className="wish-x"
                      aria-label="移除這盞天燈"
                      onClick={() => setWishes(wishes.filter((_, i) => i !== idx))}
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
