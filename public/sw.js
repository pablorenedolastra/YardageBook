/* eslint-env serviceworker, browser */
/* Service worker MVP de YardageBook (sin Workbox).
 * - Navegaciones (SPA): red con fallback a index.html cacheado → abre offline.
 * - Teselas Esri y CSS de Leaflet (CDN): cache-first (incluye respuestas opacas).
 * - Estáticos del propio origen: stale-while-revalidate.
 * Datos de campos © OpenStreetMap (ODbL); imágenes satélite © Esri.
 */
const CACHE = 'yardagebook-v1';
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

  // Navegaciones de la SPA → red, con fallback al index cacheado.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put('/index.html', copy));
          return res;
        })
        .catch(() => caches.match('/index.html').then((r) => r || caches.match('/'))),
    );
    return;
  }

  // Teselas satélite + CSS de Leaflet → cache-first (cachea también opacas).
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

  // Estáticos del propio origen → stale-while-revalidate.
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.open(CACHE).then(async (c) => {
        const hit = await c.match(req);
        const fetching = fetch(req)
          .then((res) => {
            if (res.ok) c.put(req, res.clone());
            return res;
          })
          .catch(() => hit);
        return hit || fetching;
      }),
    );
  }
});
