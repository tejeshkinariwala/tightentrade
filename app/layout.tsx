import React from 'react';
import './globals.css'
import { UserProvider } from './contexts/UserContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { EventProvider } from './contexts/EventContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <UserProvider>
            <EventProvider onRefresh={() => window.location.reload()}>
              {children}
            </EventProvider>
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
