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
        return caches.open(CACHE)
          .then(c => c.put(e.request, clone))
          .catch(error => console.warn('Failed to update cached response:', error))
          .then(() => res);
      })
      .catch(async networkError => {
        try {
          const cached = await caches.match(e.request) || await caches.match('/index.html');
          if (cached) return cached;
        } catch (cacheError) {
          throw new AggregateError([networkError, cacheError], 'Network and cache lookup both failed');
        }
        console.error('Request failed with no cached fallback:', networkError);
        return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
      })
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
      void self.registration.showNotification(title, {
        body,
        tag,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        vibrate: [200, 100, 200],
        requireInteraction: false,
      }).catch(error => console.error('Failed to show scheduled notification:', error));
    }, delay);
  }

  if (e.data.type === 'WATER_INTERVAL') {
    if (timers['water-interval']) clearInterval(timers['water-interval']);
    timers['water-interval'] = setInterval(() => {
      void self.registration.showNotification('Drink Water 💧', {
        body: 'Time for a glass of water! Stay hydrated.',
        tag: 'water-reminder',
        icon: '/icon-192.png',
        vibrate: [100, 50, 100],
      }).catch(error => console.error('Failed to show water reminder:', error));
    }, 12 * 60 * 1000); // every 12 minutes
  }
});

// Handle notification click — open/focus the app
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const c of list) {
        if (c.url.includes(self.location.origin) && 'focus' in c) return c.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow('/');
    })
  );
});
