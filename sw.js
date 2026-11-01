// Pokérole Companion: keeps the app on the device so it opens without internet.
// The page is fetched fresh when online (so a new upload is picked up), the saved copy is used offline.
const CACHE = 'prc-096c478026';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-512.png', './apple-touch-icon.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  const isPage = req.mode === 'navigate';
  e.respondWith((async () => {
    const c = await caches.open(CACHE);
    if (isPage) {
      try { const r = await fetch(req, { cache: 'no-cache' }); if (r.ok) c.put('./index.html', r.clone()); return r; }
      catch { return (await c.match('./index.html')) || (await c.match('./')) || Response.error(); }
    }
    const hit = await c.match(req, { ignoreSearch: true });
    if (hit) return hit;
    try { const r = await fetch(req); if (r.ok) c.put(req, r.clone()); return r; } catch { return Response.error(); }
  })());
});
