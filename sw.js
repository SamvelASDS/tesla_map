const CACHE = 'tesla-tiles-v2';
const TILE_HOST = /tile\.openstreetmap\.org|basemaps\.cartocdn\.com|openfreemap\.org/;

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil((async () => {
        const keys = await caches.keys();
        await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
        await self.clients.claim();
    })());
});

self.addEventListener('fetch', (event) => {
    const url = event.request.url;
    if (event.request.method !== 'GET' || !TILE_HOST.test(url)) return;
    event.respondWith((async () => {
        const cache = await caches.open(CACHE);
        const hit = await cache.match(event.request);
        if (hit) return hit;
        try {
            const res = await fetch(event.request);
            if (res && res.ok) cache.put(event.request, res.clone());
            return res;
        } catch (err) {
            const stale = await cache.match(event.request);
            if (stale) return stale;
            throw err;
        }
    })());
});
