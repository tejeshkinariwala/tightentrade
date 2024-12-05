self.addEventListener('push', function(event) {
  console.log('Push event received:', event);
  const data = event.data.json();
  console.log('Push data:', data);
  
  const options = {
    body: data.body,
    icon: '/icon.png',
    badge: '/badge.png',
    data: data.url,
    vibrate: [200, 100, 200],
    actions: data.actions,
    requireInteraction: true
  };
  console.log('Notification options:', options);

  event.waitUntil(
    self.registration.showNotification(data.title, options)
    .then(() => console.log('Notification shown'))
    .catch(err => console.error('Show notification error:', err))
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