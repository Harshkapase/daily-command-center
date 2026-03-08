// ── Daily Command Center — Service Worker ────────────────────────────────
const CACHE = 'dcc-v2';
const ASSETS = ['/', '/index.html'];

// Install: cache core assets
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

// Activate: clear old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch: network-first, fallback to cache
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match('/index.html')))
  );
});

// ── Scheduled notifications ───────────────────────────────────────────────
const timers = {};

self.addEventListener('message', e => {
  if (!e.data) return;

  if (e.data.type === 'SCHEDULE') {
    const { id, delay, title, body, tag } = e.data;
    if (timers[id]) clearTimeout(timers[id]);
    timers[id] = setTimeout(() => {
      self.registration.showNotification(title, {
        body,
        tag,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        vibrate: [200, 100, 200],
        requireInteraction: false,
      });
    }, delay);
  }

  if (e.data.type === 'WATER_INTERVAL') {
    if (timers['water-interval']) clearInterval(timers['water-interval']);
    timers['water-interval'] = setInterval(() => {
      self.registration.showNotification('Drink Water 💧', {
        body: 'Time for a glass of water! Stay hydrated.',
        tag: 'water-reminder',
        icon: '/icon-192.png',
        vibrate: [100, 50, 100],
      });
    }, 12 * 60 * 1000); // every 12 minutes
  }
});

// Handle notification click — open/focus the app
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const c of list) {
        if (c.url.includes(self.location.origin) && 'focus' in c) return c.focus();
      }
      if (clients.openWindow) return clients.openWindow('/');
    })
  );
});
