// Service Worker — XSMB 24h (Push Notifications)
const CACHE = ‘xsmb-v1’;

self.addEventListener(‘install’, () => self.skipWaiting());
self.addEventListener(‘activate’, e => e.waitUntil(self.clients.claim()));

// Basic fetch caching for offline support
self.addEventListener(‘fetch’, e => {
    if (e.request.method !== ‘GET’) return;
    if (e.request.url.includes(‘/api/’)) return; // skip API calls
    e.respondWith(
        caches.match(e.request).then(cached => cached || fetch(e.request))
    );
});

// Push notification handler
self.addEventListener(‘push’, function(event) {
    let payload = { title: ‘XSMB 24h’, body: ‘Kết quả xổ số đã có!’, url: ‘/’ };
    if (event.data) {
        try { payload = { ...payload, ...event.data.json() }; } catch { payload.body = event.data.text(); }
    }
    event.waitUntil(
        self.registration.showNotification(payload.title, {
            body: payload.body,
            icon: ‘/favicon.ico’,
            badge: ‘/favicon.ico’,
            data: { url: payload.url || ‘/’ },
            vibrate: [200, 100, 200],
            tag: ‘xsmb-result’,
            renotify: true,
        })
    );
});

// Notification click — open or focus window
self.addEventListener(‘notificationclick’, function(event) {
    event.notification.close();
    const url = event.notification.data?.url || ‘/’;
    event.waitUntil(
        clients.matchAll({ type: ‘window’, includeUncontrolled: true }).then(list => {
            const existing = list.find(c => c.url.startsWith(self.location.origin));
            if (existing) { existing.navigate(url); return existing.focus(); }
            return clients.openWindow(url);
        })
    );
});
