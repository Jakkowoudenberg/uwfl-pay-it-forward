// v13 - unregister all caches
self.addEventListener('install', e => { self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => self.clients.matchAll({type:'window'}))
      .then(clients => clients.forEach(c => c.navigate(c.url)))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', e => { e.respondWith(fetch(e.request, {cache:'no-store'})); });
