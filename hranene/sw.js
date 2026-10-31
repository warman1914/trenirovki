/* Offline: app files served from cache at once and refreshed in the background. */
const CACHE = 'hranene-v1.3';
const SHELL = ['./','./index.html','./app.js','./foods.js','./manifest.webmanifest',
  './icons/apple-touch-icon.png','./icons/icon-192.png','./icons/icon-512.png','./icons/icon-maskable-512.png','./icons/favicon-32.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL))); self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET') return;
  const url = new URL(r.url);
  const same = url.origin === location.origin, font = /fonts\.(googleapis|gstatic)\.com$/.test(url.host);
  if (!same && !font) return;
  e.respondWith(caches.open(CACHE).then(async c => {
    const hit = await c.match(r, {ignoreSearch: same});
    const net = fetch(r).then(res => { if (res && (res.ok || res.type === 'opaque')) c.put(r, res.clone()); return res; }).catch(() => null);
    if (hit) { e.waitUntil(net); return hit; }
    const res = await net; if (res) return res;
    return (same && r.mode === 'navigate') ? c.match('./index.html') : Response.error();
  }));
});
