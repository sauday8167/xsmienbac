// Service Worker — XSMB 24h (CHỈ dùng cho Push Notifications)
// QUAN TRỌNG: KHÔNG cache asset/_next. Cache-first chunk JS gây lỗi
// "Cannot read properties of undefined (reading 'call')" khi server build chunk mới.

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
    event.waitUntil((async () => {
        // Xóa sạch mọi cache cũ (đặc biệt chunk JS đã bị cache ở phiên bản SW trước)
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
        await self.clients.claim();
    })());
});

// KHÔNG có 'fetch' listener => trình duyệt luôn tải asset mới nhất từ network.

// Push notification handler
self.addEventListener('push', function (event) {
    let payload = { title: 'XSMB 24h', body: 'Kết quả xổ số đã có!', url: '/' };
    if (event.data) {
        try { payload = { ...payload, ...event.data.json() }; } catch (e) { payload.body = event.data.text(); }
    }
    event.waitUntil(
        self.registration.showNotification(payload.title, {
            body: payload.body,
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            data: { url: payload.url || '/' },
            vibrate: [200, 100, 200],
            tag: 'xsmb-result',
            renotify: true,
        })
    );
});

// Notification click — mở hoặc focus cửa sổ
self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    const url = (event.notification.data && event.notification.data.url) || '/';
    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
            const existing = list.find((c) => c.url.startsWith(self.location.origin));
            if (existing) { existing.navigate(url); return existing.focus(); }
            return self.clients.openWindow(url);
        })
    );
});
