/**
 * Socket.io client hook for React components
 * Provides real-time functionality to the expense-sharing app
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react';

// Re-export types from events
export type {
  ExpenseData,
  MemberData,
  GroupData,
  BalanceData,
  SettlementData,
} from './events';

interface UseSocketOptions {
  autoConnect?: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

/**
 * React hook for Socket.io client
 * Manages socket connection and provides event handlers
 */
export function useSocket(options: UseSocketOptions = {}) {
  const { autoConnect = true, onConnect, onDisconnect, onError } = options;
  const { data: session, status } = useSession();
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 5;

  useEffect(() => {
    // Don't connect if session is not ready or autoConnect is disabled
    if (status === 'loading' || !autoConnect) {
      return;
    }

    // Don't connect if no session
    if (!session) {
      return;
    }

    // Create socket connection
    const socketInstance = io({
      path: '/api/socket',
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
      auth: {
        token: session.accessToken,
      },
    });

    // Connection handlers
    socketInstance.on('connect', () => {
      console.log('Socket connected:', socketInstance.id);
      setIsConnected(true);
      reconnectAttemptsRef.current = 0;
      onConnect?.();
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setIsConnected(false);
      onDisconnect?.();
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      reconnectAttemptsRef.current++;
      onError?.(error);
    });

    socketInstance.on('error', (error) => {
      console.error('Socket error:', error);
      onError?.(error);
    });

    setSocket(socketInstance);

    // Cleanup on unmount
    return () => {
      socketInstance.disconnect();
      setIsConnected(false);
    };
  }, [session, status, autoConnect, onConnect, onDisconnect, onError]);

  return {
    socket,
    isConnected,
  };
}

/**
 * Hook for group-specific socket events
 */
export function useGroupSocket(groupId: string | null) {
  const { socket, isConnected } = useSocket();
  const [groupData, setGroupData] = useState<any>(null);
  const [balances, setBalances] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);

  // Join/leave group when groupId changes
  useEffect(() => {
    if (!socket || !isConnected || !groupId) {
      return;
    }

    // Join the group room
    socket.emit('join_group', { groupId });

    // Cleanup: leave the group when component unmounts or groupId changes
    return () => {
      socket.emit('leave_group', { groupId });
    };
  }, [socket, isConnected, groupId]);

  // Listen for group events
  useEffect(() => {
    if (!socket) return;

    const handleGroupUpdated = (data: any) => {
      setGroupData(data);
      if (data.members) {
        setMembers(data.members);
      }
    };

    const handleMemberAdded = (data: any) => {
      setMembers((prev) => [...prev, data.member]);
    };

    const handleMemberRemoved = (data: any) => {
      setMembers((prev) => prev.filter((m) => m.id !== data.memberId));
    };

    const handleBalancesUpdated = (data: any[]) => {
      setBalances(data);
    };

    const handleExpenseCreated = (expense: any) => {
      setExpenses((prev) => [...prev, expense]);
    };

    const handleExpenseUpdated = (expense: any) => {
      setExpenses((prev) =>
        prev.map((e) => (e.id === expense.id ? expense : e))
      );
    };

    const handleExpenseDeleted = (data: any) => {
      setExpenses((prev) => prev.filter((e) => e.id !== data.expenseId));
    };

    socket.on('group_updated', handleGroupUpdated);
    socket.on('member_added', handleMemberAdded);
    socket.on('member_removed', handleMemberRemoved);
    socket.on('balances_updated', handleBalancesUpdated);
    socket.on('expense_created', handleExpenseCreated);
    socket.on('expense_updated', handleExpenseUpdated);
    socket.on('expense_deleted', handleExpenseDeleted);

    return () => {
      socket.off('group_updated', handleGroupUpdated);
      socket.off('member_added', handleMemberAdded);
      socket.off('member_removed', handleMemberRemoved);
      socket.off('balances_updated', handleBalancesUpdated);
      socket.off('expense_created', handleExpenseCreated);
      socket.off('expense_updated', handleExpenseUpdated);
      socket.off('expense_deleted', handleExpenseDeleted);
    };
  }, [socket]);

  // Socket action methods
  const createExpense = useCallback(
    (data: {
      description: string;
      amount: number;
      paidBy: string;
      date: Date;
      category?: string;
    }) => {
      if (!socket || !groupId) return;
      socket.emit('create_expense', {
        groupId,
        ...data,
      });
    },
    [socket, groupId]
  );

  const updateExpense = useCallback(
    (data: {
      expenseId: string;
      description?: string;
      amount?: number;
      category?: string;
    }) => {
      if (!socket) return;
      socket.emit('update_expense', data);
    },
    [socket]
  );

  const deleteExpense = useCallback(
    (expenseId: string) => {
      if (!socket) return;
      socket.emit('delete_expense', { expenseId });
    },
    [socket]
  );

  const addMember = useCallback(
    (email: string) => {
      if (!socket || !groupId) return;
      socket.emit('add_member', { groupId, email });
    },
    [socket, groupId]
  );

  const removeMember = useCallback(
    (memberId: string) => {
      if (!socket || !groupId) return;
      socket.emit('remove_member', { groupId, memberId });
    },
    [socket, groupId]
  );

  const settleUp = useCallback(
    (data: { fromUserId: string; toUserId: string; amount: number }) => {
      if (!socket || !groupId) return;
      socket.emit('settle_up', {
        groupId,
        ...data,
      });
    },
    [socket, groupId]
  );

  return {
    isConnected,
    groupData,
    balances,
    expenses,
    members,
    createExpense,
    updateExpense,
    deleteExpense,
    addMember,
    removeMember,
    settleUp,
  };
}

/**
 * Hook for dashboard-wide socket events
 */
export function useDashboardSocket() {
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handlers = [
      'group_created',
      'group_updated',
      'group_deleted',
      'expense_created',
      'expense_updated',
      'expense_deleted',
    ];

    // Log all dashboard events
    handlers.forEach((event) => {
      socket.on(event, (data) => {
        console.log(`Dashboard event: ${event}`, data);
      });
    });

    return () => {
      handlers.forEach((event) => {
        socket.off(event);
      });
    };
  }, [socket]);

  return {
    isConnected,
    socket,
  };
}
