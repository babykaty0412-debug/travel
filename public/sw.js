/* 平溪×深坑 行程網站 Service Worker — 離線快取（Vite 打包版） */
var CACHE = 'pingxi-shenkeng-v3';
var CORE = ['./', './manifest.webmanifest', './icon.svg', './data/trip.json'];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches
      .open(CACHE)
      .then(function (c) {
        return c.addAll(CORE);
      })
      .then(function () {
        return self.skipWaiting();
      }),
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches
      .keys()
      .then(function (keys) {
        return Promise.all(
          keys
            .filter(function (k) {
              return k !== CACHE;
            })
            .map(function (k) {
              return caches.delete(k);
            }),
        );
      })
      .then(function () {
        return self.clients.claim();
      }),
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;

  var accept = req.headers.get('accept') || '';
  var isNav = req.mode === 'navigate' || accept.indexOf('text/html') !== -1;

  if (isNav) {
    // 網頁：優先網路（保持最新），離線退回快取
    e.respondWith(
      fetch(req)
        .then(function (res) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) {
            c.put(req, copy);
          });
          return res;
        })
        .catch(function () {
          return caches.match(req).then(function (r) {
            return r || caches.match('./');
          });
        }),
    );
    return;
  }

  // 其他資源（JS/CSS/地圖圖磚…）：優先快取、背景更新
  e.respondWith(
    caches.match(req).then(function (cached) {
      var net = fetch(req)
        .then(function (res) {
          if (res && (res.ok || res.type === 'opaque')) {
            var copy = res.clone();
            caches.open(CACHE).then(function (c) {
              c.put(req, copy);
            });
          }
          return res;
        })
        .catch(function () {
          return cached;
        });
      return cached || net;
    }),
  );
});
