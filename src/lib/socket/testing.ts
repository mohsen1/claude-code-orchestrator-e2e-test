/**
 * Socket.io testing utilities
 * Use these for debugging and testing socket connections
 */

import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

/**
 * Create a test socket connection
 * Useful for debugging in browser console
 */
export function createTestSocket(token?: string): Socket {
  const socket = io(SOCKET_URL, {
    path: '/api/socket',
    autoConnect: true,
    reconnection: true,
    auth: {
      token: token || 'test-token',
    },
  });

  // Log all events
  socket.on('connect', () => {
    console.log('✅ Socket connected:', socket.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('❌ Socket disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('⚠️ Connection error:', error.message);
  });

  socket.on('error', (error) => {
    console.error('⚠️ Socket error:', error);
  });

  // Log all incoming events
  const onevent = socket.onevent;
  socket.onevent = function (packet) {
    const args = packet.data || [];
    if (packet.data[0]) {
      console.log(`📨 Event received: ${packet.data[0]}`, packet.data[1]);
    }
    onevent.call(this, packet);
  };

  // Log all outgoing events
  const emit = socket.emit;
  socket.emit = function (event: string, ...args: any[]) {
    console.log(`📤 Event sent: ${event}`, args);
    return emit.apply(this, [event, ...args]);
  };

  return socket;
}

/**
 * Test helper: Join a group
 */
export function testJoinGroup(socket: Socket, groupId: string) {
  console.log(`Testing join_group for group: ${groupId}`);
  socket.emit('join_group', { groupId });
}

/**
 * Test helper: Create an expense
 */
export function testCreateExpense(
  socket: Socket,
  data: {
    groupId: string;
    description: string;
    amount: number;
    paidBy: string;
  }
) {
  console.log('Testing create_expense:', data);
  socket.emit('create_expense', {
    ...data,
    date: new Date(),
  });
}

/**
 * Test helper: Add a member
 */
export function testAddMember(socket: Socket, groupId: string, email: string) {
  console.log(`Testing add_member for group ${groupId}, email: ${email}`);
  socket.emit('add_member', { groupId, email });
}

/**
 * Test helper: Settle up
 */
export function testSettleUp(
  socket: Socket,
  data: {
    groupId: string;
    fromUserId: string;
    toUserId: string;
    amount: number;
  }
) {
  console.log('Testing settle_up:', data);
  socket.emit('settle_up', data);
}

/**
 * Run a complete test suite
 */
export function runSocketTestSuite(groupId: string, userId: string) {
  console.log('🧪 Starting Socket.io Test Suite');
  console.log('=====================================');

  const socket = createTestSocket();

  // Wait for connection
  socket.on('connect', () => {
    console.log('\n📍 Test 1: Join Group');
    testJoinGroup(socket, groupId);

    // Wait a bit, then create an expense
    setTimeout(() => {
      console.log('\n📍 Test 2: Create Expense');
      testCreateExpense(socket, {
        groupId,
        description: 'Test Expense',
        amount: 100,
        paidBy: userId,
      });
    }, 1000);

    // Wait, then add a member
    setTimeout(() => {
      console.log('\n📍 Test 3: Add Member');
      testAddMember(socket, groupId, 'test@example.com');
    }, 2000);

    // Wait, then settle up
    setTimeout(() => {
      console.log('\n📍 Test 4: Settle Up');
      testSettleUp(socket, {
        groupId,
        fromUserId: 'user1',
        toUserId: 'user2',
        amount: 50,
      });
    }, 3000);

    // End test
    setTimeout(() => {
      console.log('\n✅ Test Suite Complete');
      console.log('=====================================');
      socket.disconnect();
    }, 4000);
  });

  return socket;
}

/**
 * Make test functions available globally in browser
 * Add this to your _app.tsx or layout.tsx during development
 */
export function exposeTestUtils() {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    (window as any).socketTest = {
      createSocket: createTestSocket,
      joinGroup: testJoinGroup,
      createExpense: testCreateExpense,
      addMember: testAddMember,
      settleUp: testSettleUp,
      runSuite: runSocketTestSuite,
    };
    console.log('🔧 Socket test utils available at window.socketTest');
    console.log('Usage:');
    console.log('  const socket = window.socketTest.createSocket(token)');
    console.log('  window.socketTest.joinGroup(socket, "group-123")');
    console.log('  window.socketTest.runSuite("group-123", "user-123")');
  }
}
