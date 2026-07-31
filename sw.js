const CACHE = 'hydro-buddy-v6';
const URLS = ['./', './index.html', './manifest.json', './logo-192.png', './logo-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(URLS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.url.includes('chrome-extension') || e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).then(res => {
      const clone = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, clone));
      return res;
    })).catch(() => caches.match(e.request))
  );
});

self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SCHEDULE_NOTIFICATION') {
    setTimeout(() => {
      self.registration.showNotification(e.data.title, {
        body: e.data.body,
        icon: './logo-192.png',
        badge: './logo-192.png',
        tag: 'hydro-buddy',
        renotify: true,
        vibrate: [200, 100, 200]
      });
    }, e.data.delay);
  }
});
