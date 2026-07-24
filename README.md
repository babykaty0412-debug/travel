# travel
旅遊行程紀錄規劃

## 平溪 × 深坑 親子自駕 3天2夜（7/24–7/26）

- **互動網站（GitHub Pages）**：`docs/` — Leaflet 互動地圖、滑動高亮導覽、可勾選打包清單、天燈許願牆、深淺色、離線（PWA）
- **文字完整版**：`平溪深坑親子3天2夜行程.md`
- **手機圖文版（Artifact）**：`行程手機版.html`
- **自我檢查清單**：`檢查清單.md`

### 網站架構（資料驅動、好維護、可重用）

```
docs/
├─ index.html          # 骨架（只有 hero/nav/內容容器）
├─ styles.css          # 全部樣式（設計 token 化）
├─ app.js              # 由資料渲染畫面 + 所有互動（模組化）
├─ data/trip.json      # ★唯一資料來源：住宿/行程/美食/地圖點/打包/許願
├─ sw.js               # Service Worker（離線快取）
├─ manifest.webmanifest# PWA 設定
└─ icon.svg            # App 圖示
```

**要改行程？只動 `data/trip.json` 一個檔**，畫面與地圖會一起更新。
**要規劃另一趟旅程？** 複製 `docs/`，換一份 `trip.json` 即可重用整套介面。

> 本機測試：`python3 -m http.server --directory docs` 後開 `http://localhost:8000/`
> （地圖需連得上 unpkg CDN 與 OpenStreetMap）

### 如何發佈成公開網站（GitHub Pages）

1. 到 GitHub repo → **Settings** → 左側 **Pages**
2. **Build and deployment → Source** 選 **Deploy from a branch**
3. **Branch** 選 `claude/travel-itinerary-planning-r2wegp`，資料夾選 **`/docs`**，按 **Save**
4. 等 1–2 分鐘，頁面上方會出現公開網址：
   `https://babykaty0412-debug.github.io/travel/`
5. 打開就是完整互動網站，**免登入、可分享給家人**，導航按鈕正常運作

> 之後若把這個分支合併進 `main`，記得回 Settings → Pages 把 Branch 改成 `main`（同樣 `/docs`）。
