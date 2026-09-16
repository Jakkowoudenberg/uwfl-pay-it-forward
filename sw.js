// Keep installation available and always load current pages from the network.
// Never cache registrations, moderation data, API responses or uploaded photos.
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',event=>event.waitUntil(
  caches.keys().then(keys=>Promise.all(keys.filter(key=>/uwfl|pay.?it.?forward/i.test(key)).map(key=>caches.delete(key))))
    .then(()=>self.clients.claim())
));
self.addEventListener('fetch',event=>{
  if(event.request.mode==='navigate'&&event.request.method==='GET')event.respondWith(fetch(event.request,{cache:'no-store'}));
});
