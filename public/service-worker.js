self.addEventListener('push', function(event) {
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icon.png',
    badge: '/badge.png',
    data: data.url,
    vibrate: [200, 100, 200],
    actions: data.actions
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  if (event.action) {
    // Handle action button clicks
    clients.openWindow(event.action);
  } else {
    // Handle notification click
    clients.openWindow(event.notification.data);
  }
}); 