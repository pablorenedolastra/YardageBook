/* eslint-env serviceworker, browser */
/* Service worker de YardageBook.
 * Estrategia pensada para iterar rápido (PWA en testing):
 * - Mismo origen (documento + bundle + assets): NETWORK-FIRST → estando online
 *   siempre se ve el último deploy; la caché es solo respaldo offline.
 * - Teselas Esri y CSS de Leaflet (CDN): cache-first (no cambian).
 * Datos de campos © OpenStreetMap (ODbL); imágenes satélite © Esri.
 */
const CACHE = 'yardagebook-v2';
const CACHE_FIRST_HOSTS = ['server.arcgisonline.com', 'unpkg.com'];

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Teselas satélite + CSS de Leaflet → cache-first (incluye respuestas opacas).
  if (CACHE_FIRST_HOSTS.includes(url.hostname)) {
    event.respondWith(
      caches.open(CACHE).then(async (c) => {
        const hit = await c.match(req);
        if (hit) return hit;
        const res = await fetch(req);
        c.put(req, res.clone());
        return res;
      }),
    );
    return;
  }

  // Mismo origen → network-first con respaldo a caché (offline).
  if (url.origin === self.location.origin) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() =>
          caches.match(req).then((hit) => hit || (req.mode === 'navigate' ? caches.match('/') : undefined)),
        ),
    );
  }
});
