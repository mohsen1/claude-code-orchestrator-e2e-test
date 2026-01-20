'use client';

import React, { ReactNode } from 'react';
import { useSocket } from '@/hooks/useSocket';

interface SocketProviderProps {
  children: ReactNode;
}

/**
 * SocketProvider component that wraps the application
 * Handles global Socket.io connection and provides real-time event handlers
 * Updates UI state using React Context or state management when events are received
 */
export function SocketProvider({ children }: SocketProviderProps) {
  useSocket({
    onConnect: () => {
      console.log('Socket connected');
    },
    onDisconnect: () => {
      console.log('Socket disconnected');
    },
    onGroupCreated: (data) => {
      console.log('Group created:', data);
      // Trigger UI refresh or state update
      // This could dispatch to a Redux store, update a context, or trigger a re-fetch
      window.dispatchEvent(new CustomEvent('group:created', { detail: data }));
    },
    onGroupUpdated: (data) => {
      console.log('Group updated:', data);
      window.dispatchEvent(new CustomEvent('group:updated', { detail: data }));
    },
    onMemberJoined: (data) => {
      console.log('Member joined:', data);
      window.dispatchEvent(new CustomEvent('group:member:joined', { detail: data }));
    },
    onMemberLeft: (data) => {
      console.log('Member left:', data);
      window.dispatchEvent(new CustomEvent('group:member:left', { detail: data }));
    },
    onGroupDeleted: (data) => {
      console.log('Group deleted:', data);
      window.dispatchEvent(new CustomEvent('group:deleted', { detail: data }));
    },
    onSettlementCreated: (data) => {
      console.log('Settlement created:', data);
      window.dispatchEvent(new CustomEvent('settlement:created', { detail: data }));
    },
    onSettlementCompleted: (data) => {
      console.log('Settlement completed:', data);
      window.dispatchEvent(new CustomEvent('settlement:completed', { detail: data }));
    },
    onSettlementCancelled: (data) => {
      console.log('Settlement cancelled:', data);
      window.dispatchEvent(new CustomEvent('settlement:cancelled', { detail: data }));
    },
    onBalanceUpdated: (data) => {
      console.log('Balance updated:', data);
      window.dispatchEvent(new CustomEvent('settlement:balance:updated', { detail: data }));
    },
  });

  return <>{children}</>;
}

/**
 * Hook to listen to Socket events from the window event bus
 * Useful for components that need to react to real-time updates
 */
export function useSocketEvent<T = any>(
  eventName: string,
  handler: (data: T) => void
): void {
  React.useEffect(() => {
    const eventListener = (event: CustomEvent<T>) => {
      handler(event.detail);
    };

    window.addEventListener(eventName, eventListener as EventListener);

    return () => {
      window.removeEventListener(eventName, eventListener as EventListener);
    };
  }, [eventName, handler]);
}
