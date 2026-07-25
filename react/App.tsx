import { useEffect, useMemo, useState } from 'react';
import type { Trip } from '../src/types';
import { assertTrip, countdownLabel } from '../src/logic';
import { gmaps } from '../src/util';
import { useScrollSpy, useTheme } from './hooks';
import { MapView } from './MapView';
import { Packing } from './Packing';
import { WishWall } from './WishWall';

const html = (s: string) => ({ __html: s });

function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 500);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <button
      className={`toTop${show ? ' show' : ''}`}
      aria-label="回到頂端"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    >
      ↑
    </button>
  );
}

export function App() {
  const [data, setData] = useState<Trip | null>(null);
  const [error, setError] = useState(false);
  const { isDark, toggle } = useTheme();

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/trip.json`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((json: unknown) => {
        assertTrip(json);
        setData(json);
      })
      .catch(() => setError(true));
  }, []);

  const navItems = useMemo(
    () =>
      data
        ? [
            { id: 'map-sec', label: '地圖' },
            { id: 'stays', label: '住宿' },
            ...data.days.map((d) => ({ id: d.id, label: d.tag })),
            { id: 'food', label: '美食' },
            { id: 'pack', label: '打包' },
            { id: 'tips', label: '提醒' },
            { id: 'wish', label: '許願' },
          ]
        : [],
    [data],
  );
  const active = useScrollSpy(navItems.map((n) => n.id));

  const countdown = useMemo(() => {
    if (!data) return '';
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return countdownLabel(
      today,
      new Date(`${data.meta.trip.start}T00:00:00`),
      new Date(`${data.meta.trip.end}T00:00:00`),
    );
  }, [data]);

  if (error) {
    return (
      <main className="page">
        <p className="maphint" style={{ padding: '40px 0', textAlign: 'center', fontSize: 14 }}>
          行程載入失敗，請確認網路後重新整理 🔄
        </p>
      </main>
    );
  }
  if (!data) return <main className="page" />;

  return (
    <>
      <button className="themebtn" aria-label="切換深淺色" onClick={toggle}>
        {isDark ? '☀️' : '🌙'}
      </button>

      <main className="page">
        <header className="hero">
          <span className="lantern l1" />
          <span className="lantern l2" />
          <span className="lantern l3" />
          <p className="eyebrow">{data.meta.eyebrow} · React</p>
          <h1 dangerouslySetInnerHTML={html(data.meta.heading)} />
          <p className="sub">{data.meta.sub}</p>
          <div className="meta-row">
            {data.meta.chips.map((c, i) => (
              <span className="chip" key={i} dangerouslySetInnerHTML={html(c)} />
            ))}
          </div>
          <div className="countdown">{countdown}</div>
        </header>

        <nav aria-label="快速跳轉">
          <div className="nav-inner" id="navInner">
            {navItems.map((n) => (
              <a
                key={n.id}
                href={`#${n.id}`}
                className={active === n.id ? 'active' : ''}
                aria-current={active === n.id ? 'true' : undefined}
              >
                {n.label}
              </a>
            ))}
          </div>
        </nav>

        <section id="map-sec">
          <h2 className="sec-title">🗺️ 行程地圖</h2>
          <MapView data={data} isDark={isDark} />
          <div className="legend">
            {data.map.legend.map((l, i) => (
              <span key={i} dangerouslySetInnerHTML={html(l)} />
            ))}
          </div>
          <p className="maphint">{data.map.hint}</p>
        </section>

        <section id="stays">
          <h2 className="sec-title">🏨 兩晚住宿</h2>
          <div className="stays">
            {data.stays.map((s, i) => (
              <div className="stay" key={i}>
                <div className="night">{s.night}</div>
                <p className="name">{s.name}</p>
                <p className="addr">{s.addr}</p>
                <p className="feat">{s.feat}</p>
                <div className="btnrow">
                  <a className="navbtn" target="_blank" rel="noopener" href={gmaps(s.query)}>
                    📍 導航
                  </a>
                  {s.tel && (
                    <a className="navbtn tel" href={`tel:${s.tel.replace(/-/g, '')}`}>
                      ☎ {s.tel}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {data.days.map((d) => (
          <section id={d.id} key={d.id}>
            <div className="day-head">
              <span className={`day-tag ${d.color}`}>{d.tag}</span>
              <span className="day-date">{d.date}</span>
            </div>
            <p className="day-title">{d.title}</p>
            <div className="timeline">
              {d.stops.map((stop, i) => {
                const color = stop.color ?? d.color;
                const cardCls = ['card', stop.highlight && 'hl', stop.opt && 'opt']
                  .filter(Boolean)
                  .join(' ');
                return (
                  <div className={`stop ${color}`} key={i}>
                    <span className="time tnum">{stop.time}</span>
                    <div className={cardCls}>
                      <p className="h">
                        {stop.title}
                        {stop.badge && (
                          <>
                            {' '}
                            <span className="badge">{stop.badge}</span>
                          </>
                        )}
                      </p>
                      {stop.drive && <p className="drive">{stop.drive}</p>}
                      {stop.bullets && (
                        <ul>
                          {stop.bullets.map((b, j) => (
                            <li key={j} dangerouslySetInnerHTML={html(b)} />
                          ))}
                        </ul>
                      )}
                      {stop.query && (
                        <a
                          className="mini-nav"
                          target="_blank"
                          rel="noopener"
                          href={gmaps(stop.query)}
                        >
                          導航 ↗
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}

        <section id="food">
          <h2 className="sec-title">🍜 老街美食名店</h2>
          <div className="block foodblock">
            {data.food.cards.map((c, i) => (
              <div className={`subcard ${c.green ? 'green' : ''}`} key={i}>
                <p className="who">{c.title}</p>
                <ul>
                  {c.items.map((it, j) => (
                    <li key={j} dangerouslySetInnerHTML={html(it)} />
                  ))}
                </ul>
                {c.navs && (
                  <div className="chips-nav">
                    {c.navs.map((n, k) => (
                      <a
                        className="mini-nav"
                        target="_blank"
                        rel="noopener"
                        href={gmaps(n.query)}
                        key={k}
                      >
                        {n.label}
                      </a>
                    ))}
                  </div>
                )}
                {c.note && <p className="subcard-note" dangerouslySetInnerHTML={html(c.note)} />}
              </div>
            ))}
            <p className="food-note" dangerouslySetInnerHTML={html(data.food.note)} />
          </div>
        </section>

        <Packing items={data.packing} />

        <section id="tips">
          <h2 className="sec-title">{data.tipsHeading}</h2>
          <div className="block block-mb">
            <p className="block-title">{data.rainy.title}</p>
            <ul className="tips">
              {data.rainy.items.map((t, i) => (
                <li key={i}>
                  <span className="ic">{t.ic}</span>
                  <span dangerouslySetInnerHTML={html(t.html)} />
                </li>
              ))}
            </ul>
          </div>
          <div className="block">
            <p className="block-title">{data.drive.title}</p>
            <ul className="tips">
              {data.drive.items.map((t, i) => (
                <li key={i}>
                  <span className="ic">{t.ic}</span>
                  <span dangerouslySetInnerHTML={html(t.html)} />
                </li>
              ))}
            </ul>
            <table className="drv tnum drv-mt">
              <tbody>
                {data.drive.table.map((r, i) => (
                  <tr key={i}>
                    <td>{r[0]}</td>
                    <td>{r[1]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <WishWall wish={data.wish} />

        <footer>
          <div className="flame">🏮</div>
          <span dangerouslySetInnerHTML={html(data.footer.join('<br>'))} />
        </footer>
      </main>

      <BackToTop />
    </>
  );
}
