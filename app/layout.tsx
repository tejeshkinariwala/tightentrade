'use client';

import React from 'react';
import './globals.css'
import { UserProvider } from './contexts/UserContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { EventProvider } from './contexts/EventContext';
import { useEffect, useState } from 'react';
import { requestNotificationPermission } from './utils/notifications';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    // Check if already subscribed
    if ('Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted');
    }
  }, []);

  return (
    <html lang="en">
      <body>
        {!notificationsEnabled && (
          <button
            onClick={async () => {
              const enabled = await requestNotificationPermission();
              setNotificationsEnabled(enabled);
            }}
            className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded"
          >
            Enable Notifications
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
