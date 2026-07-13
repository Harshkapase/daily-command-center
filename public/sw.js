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
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;

  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (res.ok && res.type === 'basic') {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      })
      .catch(async () => {
        const cached = await caches.match(e.request);
        if (cached) return cached;
        if (e.request.mode === 'navigate') return caches.match('/index.html');
        return Response.error();
      })
  );
});

// ── Scheduled notifications ───────────────────────────────────────────────
const timers = new Map();

self.addEventListener('message', e => {
  if (!e.data) return;

  if (e.data.type === 'SCHEDULE') {
    const { id, delay, title, body, tag } = e.data;
    const timerId = String(id);
    const delayMs = Number(delay);
    if (!timerId || !Number.isFinite(delayMs) || delayMs < 0 || delayMs > 24 * 60 * 60 * 1000) return;

    if (timers.has(timerId)) clearTimeout(timers.get(timerId));
    timers.set(timerId, setTimeout(() => {
      self.registration.showNotification(String(title).slice(0, 100), {
        body: String(body).slice(0, 300),
        tag: String(tag).slice(0, 100),
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        vibrate: [200, 100, 200],
        requireInteraction: false,
      });
      timers.delete(timerId);
    }, delayMs));
  }

  if (e.data.type === 'WATER_INTERVAL') {
    if (timers.has('water-interval')) clearInterval(timers.get('water-interval'));
    timers.set('water-interval', setInterval(() => {
      self.registration.showNotification('Drink Water 💧', {
        body: 'Time for a glass of water! Stay hydrated.',
        tag: 'water-reminder',
        icon: '/icon-192.png',
        vibrate: [100, 50, 100],
      });
    }, 12 * 60 * 1000)); // every 12 minutes
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
