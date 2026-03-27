self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));
 
self.addEventListener('push', () => {
  if ("showNotification" in self.registration)
    self.registration.showNotification('Scones Queue System', {
      body: 'Your Queue Number has been Called!',
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
 