import { useEffect, useRef } from 'react';
import type { Trip } from '../src/types';
import { initMap, type MapController } from '../src/map';

/** 以 useEffect 包裝既有的 Leaflet 初始化邏輯（跨版本共用 src/map.ts） */
export function MapView({ data, isDark }: { data: Trip; isDark: boolean }) {
  const controller = useRef<MapController | null>(null);
  const inited = useRef(false);

  useEffect(() => {
    if (inited.current) return; // StrictMode 會呼叫兩次，僅初始化一次
    inited.current = true;
    controller.current = initMap(data, isDark);
    // 初始 isDark 於此帶入，後續變化由下方 effect 處理
  }, [data]); // eslint-disable-line

  useEffect(() => {
    controller.current?.setTheme(isDark);
  }, [isDark]);

  return <div id="map" />;
}
