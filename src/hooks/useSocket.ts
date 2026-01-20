'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

// Types for Socket.io events
interface GroupCreatedEvent {
  groupId: string;
  name: string;
  description?: string;
  createdBy: string;
  createdAt: Date;
  members: Array<{
    userId: string;
    name: string;
    email: string;
  }>;
}

interface GroupUpdatedEvent {
  groupId: string;
  name?: string;
  description?: string;
  updatedBy: string;
  updatedAt: Date;
}

interface MemberJoinedEvent {
  groupId: string;
  memberId: string;
  name: string;
  email: string;
  joinedAt: Date;
  invitedBy?: string;
}

interface MemberLeftEvent {
  groupId: string;
  memberId: string;
  leftAt: Date;
}

interface GroupDeletedEvent {
  groupId: string;
  deletedBy: string;
  deletedAt: Date;
}

interface SettlementCreatedEvent {
  settlementId: string;
  groupId: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  amount: number;
  currency: string;
  createdAt: Date;
  status: 'pending' | 'completed' | 'cancelled';
}

interface SettlementCompletedEvent {
  settlementId: string;
  groupId: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  completedAt: Date;
}

interface SettlementCancelledEvent {
  settlementId: string;
  groupId: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  cancelledAt: Date;
  cancelledBy: string;
  reason?: string;
}

interface BalanceUpdatedEvent {
  groupId: string;
  oldBalance: number;
  newBalance: number;
  updatedAt: Date;
}

// Event handler types
type GroupCreatedHandler = (data: GroupCreatedEvent) => void;
type GroupUpdatedHandler = (data: GroupUpdatedEvent) => void;
type MemberJoinedHandler = (data: MemberJoinedEvent) => void;
type MemberLeftHandler = (data: MemberLeftEvent) => void;
type GroupDeletedHandler = (data: GroupDeletedEvent) => void;
type SettlementCreatedHandler = (data: SettlementCreatedEvent) => void;
type SettlementCompletedHandler = (data: SettlementCompletedEvent) => void;
type SettlementCancelledHandler = (data: SettlementCancelledEvent) => void;
type BalanceUpdatedHandler = (data: BalanceUpdatedEvent) => void;

interface UseSocketOptions {
  onGroupCreated?: GroupCreatedHandler;
  onGroupUpdated?: GroupUpdatedHandler;
  onMemberJoined?: MemberJoinedHandler;
  onMemberLeft?: MemberLeftHandler;
  onGroupDeleted?: GroupDeletedHandler;
  onSettlementCreated?: SettlementCreatedHandler;
  onSettlementCompleted?: SettlementCompletedHandler;
  onSettlementCancelled?: SettlementCancelledHandler;
  onBalanceUpdated?: BalanceUpdatedHandler;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
}

/**
 * Custom hook for managing Socket.io connections and real-time events
 * Handles all group and settlement-related real-time updates
 */
export function useSocket(options: UseSocketOptions = {}): UseSocketReturn {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const optionsRef = useRef(options);

  // Update options ref when they change
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const connect = useCallback(() => {
    if (socket?.connected) return;

    const socketInstance = io({
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
      optionsRef.current.onConnect?.();
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
      optionsRef.current.onDisconnect?.();
    });

    // Group events
    socketInstance.on('group:created', (data: GroupCreatedEvent) => {
      optionsRef.current.onGroupCreated?.(data);
    });

    socketInstance.on('group:updated', (data: GroupUpdatedEvent) => {
      optionsRef.current.onGroupUpdated?.(data);
    });

    socketInstance.on('group:member:joined', (data: MemberJoinedEvent) => {
      optionsRef.current.onMemberJoined?.(data);
    });

    socketInstance.on('group:member:left', (data: MemberLeftEvent) => {
      optionsRef.current.onMemberLeft?.(data);
    });

    socketInstance.on('group:deleted', (data: GroupDeletedEvent) => {
      optionsRef.current.onGroupDeleted?.(data);
    });

    // Settlement events
    socketInstance.on('settlement:created', (data: SettlementCreatedEvent) => {
      optionsRef.current.onSettlementCreated?.(data);
    });

    socketInstance.on('settlement:completed', (data: SettlementCompletedEvent) => {
      optionsRef.current.onSettlementCompleted?.(data);
    });

    socketInstance.on('settlement:cancelled', (data: SettlementCancelledEvent) => {
      optionsRef.current.onSettlementCancelled?.(data);
    });

    socketInstance.on('settlement:balance:updated', (data: BalanceUpdatedEvent) => {
      optionsRef.current.onBalanceUpdated?.(data);
    });

    socketInstance.connect();
    setSocket(socketInstance);
  }, [socket]);

  const disconnect = useCallback(() => {
    socket?.disconnect();
    setSocket(null);
    setIsConnected(false);
  }, [socket]);

  // Auto-connect on mount and disconnect on unmount
  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    socket,
    isConnected,
    connect,
    disconnect,
  };
}
