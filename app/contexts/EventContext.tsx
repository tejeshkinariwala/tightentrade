'use client';

import React, { createContext, useContext, useEffect } from 'react';

interface EventContextType {
  refreshData: () => void;
}

const EventContext = createContext<EventContextType>({ refreshData: () => {} });

export function EventProvider({ children }: { children: React.ReactNode }) {
  const refresh = () => {
    window.location.reload();
  };

  useEffect(() => {
    const eventSource = new EventSource('/api/events');

    eventSource.onmessage = (event) => {
      console.log('Received event:', event.data);
      refresh();
    };

    eventSource.onerror = (error) => {
      console.error('EventSource error:', error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <EventContext.Provider value={{ refreshData: refresh }}>
      {children}
    </EventContext.Provider>
  );
}

export const useEvents = () => useContext(EventContext); 