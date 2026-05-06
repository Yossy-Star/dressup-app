// ===== キャッシュ名（毎回変わる）=====
const CACHE_NAME = "dressup-v" + Date.now();

// ===== インストール =====
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
  );
});

// ===== フェッチ（キャッシュ＋ネット）=====
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {

      // キャッシュにあればそれを返す
      if (response) return response;

      // なければネット取得してキャッシュ
      return fetch(event.request).then((res) => {
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, res.clone());
          return res;
        });
      });

    })
  );
});

// ===== 古いキャッシュ削除 =====
self.addEventListener("activate", (event) => {
  const keep = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (!keep.includes(key)) {
            return caches.delete(key);
          }
        })
      )
    )
  );
});