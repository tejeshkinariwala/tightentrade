export async function subscribeToPushNotifications() {
  try {
    if (!('serviceWorker' in navigator)) {
      console.log('Service Workers not supported');
      alert('Your browser does not support Service Workers');
      return false;
    }
    
    if (!('PushManager' in window)) {
      console.log('Push notifications not supported');
      alert('Your browser does not support Push Notifications');
      return false;
    }

    // Unregister any existing service workers
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      await registration.unregister();
    }

    const registration = await navigator.serviceWorker.register('/service-worker.js');
    console.log('Service Worker registered');

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    });
    console.log('Push subscription created:', subscription);

    const response = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscription)
    });

    if (!response.ok) {
      throw new Error('Failed to store subscription');
    }

    return true;
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    return false;
  }
}

export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.log('Notifications not supported');
    return false;
  }

  const permission = await Notification.requestPermission();
  if (permission === 'granted') {
    return await subscribeToPushNotifications();
  }
  return false;
} 