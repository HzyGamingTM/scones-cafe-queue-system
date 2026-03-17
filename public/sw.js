self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));
 
self.addEventListener('push', () => {
  self.registration.showNotification('🔔 App Notification', {
    body: 'Something just happened on the server!',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'server-alert',
    data: { url: '/' },
  });
});
 
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data?.url || '/'));
});
 