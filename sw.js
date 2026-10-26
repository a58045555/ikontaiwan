// 極真人生 offline cache.
// Pages: network first, so a new deploy shows up right away; the cached copy is only used offline.
// Images, sounds and scripts: served from cache, refreshed in the background.
const VERSION = 'kl-sw-1';
const CORE = ['./', 'index.html', 'manifest.json', 'migrate.js', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || req.headers.has('range')) return;
  const url = new URL(req.url);
  if (url.origin !== location.origin || url.pathname.startsWith('/api/')) return;

  const isPage = req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html');
  if (isPage) {
    e.respondWith(fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req, {ignoreSearch: true}).then(hit => hit || Response.error())));
    return;
  }

  e.respondWith(caches.open(VERSION).then(async c => {
    const hit = await c.match(req);
    const net = fetch(req).then(res => {
      if (res.ok && res.type === 'basic') c.put(req, res.clone());
      return res;
    }).catch(() => hit);
    if (hit) { e.waitUntil(net); return hit; }
    return net;
  }));
});
