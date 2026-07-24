import { useLocalStorage } from './hooks';
import { confetti, toast } from '../src/fx';

/** 打包清單（React 版）— 與 vanilla 版共用同一個 localStorage key（packv1） */
export function Packing({ items }: { items: string[] }) {
  const [state, setState] = useLocalStorage<Record<string, boolean>>('packv1', {});
  const done = items.filter((_, i) => state[`i${i}`]).length;

  const toggle = (i: number): void => {
    setState((prev) => {
      const next = { ...prev, [`i${i}`]: !prev[`i${i}`] };
      const count = items.filter((_, j) => next[`i${j}`]).length;
      if (next[`i${i}`] && count === items.length) {
        confetti();
        toast('打包完成，出發囉！🎉');
      }
      return next;
    });
  };

  return (
    <section id="pack">
      <h2 className="sec-title">🎒 打包清單</h2>
      <div className="block">
        <div className="ck-head">
          <span className="ck-count" id="ckCount">
            {done} / {items.length}
          </span>
          <button className="ck-reset" id="ckReset" onClick={() => setState({})}>
            清除勾選
          </button>
        </div>
        <ul className="checklist" id="checklist">
          {items.map((text, i) => (
            <li key={i}>
              <input
                type="checkbox"
                id={`ck${i}`}
                checked={Boolean(state[`i${i}`])}
                onChange={() => toggle(i)}
              />
              <label htmlFor={`ck${i}`}>{text}</label>
            </li>
          ))}
        </ul>
        <p className="pack-note">✅ 勾選會自動記住（存在這支手機的瀏覽器裡），下次打開還在。</p>
      </div>
    </section>
  );
}
