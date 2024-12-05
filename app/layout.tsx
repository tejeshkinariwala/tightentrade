'use client';

import React from 'react';
import './globals.css'
import { UserProvider } from './contexts/UserContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { EventProvider } from './contexts/EventContext';
import { useEffect, useState } from 'react';
import { requestNotificationPermission, subscribeToPushNotifications } from './utils/notifications';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  const testNotification = async () => {
    try {
      // Check if service worker is registered
      const registrations = await navigator.serviceWorker.getRegistrations();
      console.log('Current service workers:', registrations);
      if (registrations.length === 0) {
        console.log('No service worker found, registering again...');
        await subscribeToPushNotifications();
      }

      const response = await fetch('/api/test-notification');
      const data = await response.json();
      console.log('Test notification response:', data);
    } catch (error) {
      console.error('Test notification error:', error);
    }
  };

  useEffect(() => {
    // Check if notifications are supported
    const supported = 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
    setIsSupported(supported);

    if (supported && 'Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted');
    }
  }, []);

  return (
    <html lang="en">
      <body>
        {!notificationsEnabled && (
          <button
            onClick={async () => {
              if (!isSupported) {
                alert('Push notifications are not supported on this device/browser');
                return;
              }
              const enabled = await requestNotificationPermission();
              setNotificationsEnabled(enabled);
            }}
            className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded"
          >
            {isSupported ? 'Enable Notifications' : 'Notifications Not Supported'}
          </button>
        )}
        {notificationsEnabled && (
          <button
            onClick={testNotification}
            className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded"
          >
            Test Notification
          </button>
        )}
        <ThemeProvider>
          <UserProvider>
            <EventProvider>
              {children}
            </EventProvider>
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
