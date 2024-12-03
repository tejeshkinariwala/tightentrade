'use client';

import React, { createContext, useContext, useEffect } from 'react';

interface EventContextType {
  refreshData: () => void;
}

const EventContext = createContext<EventContextType>({ refreshData: () => {} });

export function EventProvider({ 
  children,
  onRefresh 
}: { 
  children: React.ReactNode;
  onRefresh: () => void;
}) {
  useEffect(() => {
    const eventSource = new EventSource('/api/events');

    eventSource.onmessage = (event) => {
      console.log('Received event:', event.data);
      onRefresh();
    };

    eventSource.onerror = (error) => {
      console.error('EventSource error:', error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [onRefresh]);

  return (
    <EventContext.Provider value={{ refreshData: onRefresh }}>
      {children}
    </EventContext.Provider>
  );
}

export const useEvents = () => useContext(EventContext); 