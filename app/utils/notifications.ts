export async function subscribeToPushNotifications() {
  try {
    console.log('=== SUBSCRIBE START ===');
    if (!('serviceWorker' in navigator)) {
      console.error('Service Workers not supported');
      return false;
    }
    
    if (!('PushManager' in window)) {
      console.error('Push notifications not supported');
      return false;
    }

    // First unregister any existing service workers
    const existingRegistrations = await navigator.serviceWorker.getRegistrations();
    console.log('Existing service workers:', existingRegistrations.length);
    for (const registration of existingRegistrations) {
      await registration.unregister();
      console.log('Unregistered service worker');
    }

    // Register new service worker
    console.log('Registering new service worker...');
    const registration = await navigator.serviceWorker.register('/service-worker.js', {
      scope: '/'
    });
    console.log('Service Worker registered:', registration);

    // Get push subscription
    console.log('Getting push subscription...');
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    });
    console.log('Push subscription created:', subscription);

    // Store subscription in backend
    console.log('Storing subscription...');
    const response = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscription)
    });

    if (!response.ok) {
      throw new Error('Failed to store subscription');
    }

    console.log('=== SUBSCRIBE END ===');
    return true;
  } catch (error) {
    console.error('Subscription error:', error);
    return false;
  }
}

async function clearServiceWorkers() {
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      await registration.unregister();
    }
    console.log('Service workers cleared');
  }
}

export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.log('Notifications not supported');
    return false;
  }

  // Clear existing service workers first
  await clearServiceWorkers();

  const permission = await Notification.requestPermission();
  if (permission === 'granted') {
    return await subscribeToPushNotifications();
  }
  return false;
} 