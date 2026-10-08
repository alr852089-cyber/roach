// Roach — Service Worker (offline cache)
const CACHE = 'roach-v1';
const FILES = [
  './',
  './index.html',
  './manifest.json',
  './style.css',
  './app.js'
];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(FILES)).catch(()=>{})
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => {
      if(r) return r;
      return fetch(e.request).then(resp => {
        // cache new files (same-origin only)
        if(resp && resp.status === 200 && e.request.url.startsWith(self.location.origin)){
          const clone = resp.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return resp;
      }).catch(() => caches.match('./index.html'));
    })
  );
});
