/** 行程資料模型（data/trip.json 的唯一型別來源） */

export interface Place {
  name: string;
  desc: string;
  query: string;
  lat: number;
  lng: number;
  day: number;
  hotel?: boolean;
}

export interface Stay {
  night: string;
  name: string;
  addr: string;
  feat: string;
  query: string;
  tel?: string;
}

export interface Stop {
  time: string;
  title: string;
  color?: string;
  badge?: string;
  highlight?: boolean;
  opt?: boolean;
  drive?: string;
  bullets?: string[];
  query?: string;
}

export interface Day {
  id: string;
  tag: string;
  color: string;
  date: string;
  title: string;
  stops: Stop[];
}

export interface FoodNav {
  label: string;
  query: string;
}

export interface FoodCard {
  title: string;
  green: boolean;
  items: string[];
  navs?: FoodNav[];
  note?: string;
}

export interface TipItem {
  ic: string;
  html: string;
}

export interface Trip {
  meta: {
    eyebrow: string;
    heading: string;
    sub: string;
    chips: string[];
    trip: { start: string; end: string };
  };
  dayColors: Record<string, string>;
  dayEmoji: Record<string, string>;
  map: { hint: string; legend: string[]; places: Place[] };
  stays: Stay[];
  days: Day[];
  food: { cards: FoodCard[]; note: string };
  packing: string[];
  tipsHeading: string;
  rainy: { title: string; items: TipItem[] };
  drive: { title: string; items: TipItem[]; table: [string, string][] };
  wish: {
    intro: string;
    placeholder: string;
    whoPlaceholder: string;
    button: string;
    suggestHint: string;
    suggests: string[];
    pool: string[];
  };
  footer: string[];
}

export interface WishEntry {
  text: string;
  who: string;
  at: number;
}
