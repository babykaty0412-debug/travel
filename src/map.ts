/** Leaflet 互動地圖：主題連動的地圖磚 + 沿實際道路的路線（OSRM，失敗則退回直線） */
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Trip, Place } from './types';
import { gmaps, esc } from './util';

const TILES = {
  light: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
};
const ATTRIB = '&copy; OpenStreetMap &copy; CARTO';

export interface MapController {
  setTheme(dark: boolean): void;
}

function markerIcon(color: string, emoji: string): L.DivIcon {
  return L.divIcon({
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -26],
    html: `<div class="pin" style="background:${color}"><span>${emoji}</span></div>`,
  });
}

function popupHTML(p: Place): string {
  return (
    `<div class="pop-h">${esc(p.name)}</div><div class="pop-d">${esc(p.desc)}</div>` +
    `<a class="pop-nav" target="_blank" rel="noopener" href="${gmaps(p.query)}">🧭 Google 導航</a>`
  );
}

/** 以 OSRM 取得沿道路路線；失敗回傳 null 讓呼叫端退回直線 */
async function fetchRoute(points: Place[]): Promise<L.LatLngExpression[] | null> {
  const coords = points.map((p) => `${p.lng},${p.lat}`).join(';');
  const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = (await res.json()) as {
      routes?: { geometry: { coordinates: [number, number][] } }[];
    };
    const line = data.routes?.[0]?.geometry.coordinates;
    if (!line) return null;
    return line.map(([lng, lat]) => [lat, lng] as L.LatLngExpression);
  } catch {
    return null;
  }
}

export function initMap(data: Trip, isDark: boolean): MapController {
  const map = L.map('map', { scrollWheelZoom: false });
  let tiles = L.tileLayer(isDark ? TILES.dark : TILES.light, {
    maxZoom: 19,
    attribution: ATTRIB,
  }).addTo(map);

  const markers = data.map.places.map((p) => {
    const color = data.dayColors[p.day];
    const emoji = p.hotel ? '🏨' : (data.dayEmoji[p.day] ?? '📍');
    return L.marker([p.lat, p.lng], { icon: markerIcon(color, emoji) })
      .addTo(map)
      .bindPopup(popupHTML(p));
  });

  map.fitBounds(L.featureGroup(markers).getBounds().pad(0.18));

  // 每天畫一條路線：先放直線佔位，OSRM 成功後換成實際道路
  for (const day of Object.keys(data.dayColors)) {
    const pts = data.map.places.filter((p) => String(p.day) === day);
    if (pts.length < 2) continue;
    const color = data.dayColors[day];
    const straight: L.LatLngExpression[] = pts.map((p) => [p.lat, p.lng]);
    let line = L.polyline(straight, { color, weight: 3, opacity: 0.45, dashArray: '5,7' }).addTo(
      map,
    );
    void fetchRoute(pts).then((road) => {
      if (!road) return;
      map.removeLayer(line);
      line = L.polyline(road, { color, weight: 4, opacity: 0.7 }).addTo(map);
    });
  }

  return {
    setTheme(dark: boolean): void {
      map.removeLayer(tiles);
      tiles = L.tileLayer(dark ? TILES.dark : TILES.light, {
        maxZoom: 19,
        attribution: ATTRIB,
      }).addTo(map);
    },
  };
}
