const CACHE = "hk-v1";
const ASSETS = ["/", "/index.html", "/manifest.json"];

// Install — cache core assets
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

// Fetch — serve from cache, fallback to network
self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).catch(() => caches.match("/index.html")))
  );
});

// Notification click — focus or open app
self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(list => {
      if (list.length) return list[0].focus();
      return clients.openWindow("/");
    })
  );
});

// Message from app — schedule a notification
self.addEventListener("message", e => {
  if (e.data?.type === "SCHEDULE") {
    const { id, delay, title, body, tag } = e.data;
    setTimeout(() => {
      self.registration.showNotification(title, {
        body,
        tag,
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        vibrate: [200, 100, 200],
        requireInteraction: false,
        silent: false,
      });
    }, delay);
  }

  if (e.data?.type === "WATER_INTERVAL") {
    // Re-schedule water reminder every 12 min
    const reschedule = () => {
      setTimeout(() => {
        self.registration.showNotification("💧 Drink Water!", {
          body: "Time for a glass of water — stay hydrated!",
          tag: "water-reminder",
          icon: "/icon-192.png",
          vibrate: [100, 50, 100],
        });
        reschedule();
      }, 12 * 60 * 1000);
    };
    reschedule();
  }
});
