// GonioLens offline app shell. Bump VERSION whenever any file changes.
// Cache-first: the app opens instantly even with no or slow internet; updates download in the background.
const VERSION = 'goniolens-2.0.1';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon.svg', './icon-180.png', './icon-192.png', './icon-512.png', './icon-512-maskable.png', './favicon-32.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url); if (url.origin !== location.origin) return;
  const isPage = req.mode === 'navigate';
  e.respondWith(caches.open(VERSION).then(async cache => {
    const hit = await cache.match(isPage ? './index.html' : req, { ignoreSearch: true });
    const net = fetch(req).then(r => { if (r && r.ok && !isPage) cache.put(req, r.clone()); if (r && r.ok && isPage) cache.put('./index.html', r.clone()); return r; }).catch(() => null);
    if (hit) { e.waitUntil(net); return hit; }
    return (await net) || (await cache.match('./index.html')) || Response.error();
  }));
});
