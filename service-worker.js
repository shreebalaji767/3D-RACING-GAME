/* Neon Highway 3D offline cache. Cache failures never block normal online play. */
const CACHE = "neon-highway-shell-v7";
const LOCAL_FILES = [
  "./", "./index.html", "./style.css", "./game.js", "./upgrade.js",
  "./feature-pack.js", "./championship-pack.js", "./fair-play.js", "./racing-engine.js",
  "./enhancement-pack.js", "./race-engineer.js", "./logo.svg", "./favicon.svg"
];
const CDN_FILES = [
  "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js",
  "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/loaders/GLTFLoader.js"
];
self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await Promise.all(LOCAL_FILES.map((path) => cache.add(path).catch(() => null)));
    await Promise.all(CDN_FILES.map(async (url) => {
      try {
        const response = await fetch(url, { mode: "cors" });
        if (response.ok) await cache.put(url, response);
      } catch { /* CDN may be offline during install. */ }
    }));
    await self.skipWaiting();
  })());
});
self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key.startsWith("neon-highway-") && key !== CACHE).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  const sameOrigin = url.origin === self.location.origin;
  const cachedCDN = CDN_FILES.includes(request.url);
  if (!sameOrigin && !cachedCDN) return;
  if (request.mode === "navigate") {
    event.respondWith(fetch(request).then((response) => {
      const copy = response.clone();
      caches.open(CACHE).then((cache) => cache.put("./index.html", copy)).catch(() => {});
      return response;
    }).catch(async () => (await caches.match(request, { ignoreSearch: true })) || (await caches.match("./index.html"))));
    return;
  }
  event.respondWith(caches.match(request).then((cached) => cached || fetch(request).then((response) => {
    if (response.ok && (sameOrigin || response.type === "cors")) {
      const copy = response.clone();
      caches.open(CACHE).then((cache) => cache.put(request, copy)).catch(() => {});
    }
    return response;
  })));
});
