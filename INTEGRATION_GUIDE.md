# Socket.io Integration Guide

This guide explains how to integrate the Socket.io server into your expense-sharing application.

## Quick Start

### 1. Start the Custom Server

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

### 2. Use in Your Components

```typescript
// app/groups/[id]/page.tsx
'use client';

import { useGroupSocket } from '@/lib/socket/client';

export default function GroupPage({ params }) {
  const { isConnected, balances, expenses, createExpense } =
    useGroupSocket(params.id);

  return (
    <div>
      <p>Status: {isConnected ? 'Connected' : 'Connecting...'}</p>
      {/* Your UI */}
    </div>
  );
}
```

## File Structure

```
src/lib/socket/
├── server.ts              # Main Socket.io server
├── events.ts              # Type definitions and event names
├── index.ts               # Initialization utilities
├── client.ts              # React hooks for clients
├── testing.ts             # Testing utilities
└── handlers/
    ├── group-handler.ts   # Group event handlers
    └── expense-handler.ts # Expense event handlers
```

## Authentication Flow

1. **Client connects** → Socket.io handshake
2. **Server verifies** → NextAuth session token
3. **Socket receives** → userId, userName, userEmail
4. **User joins** → Group rooms
5. **Events flow** → Between client and server

## Real-time Features

### Automatic Updates

When any of these actions occur, all connected clients in the group receive updates:

- ✅ Expense created/updated/deleted
- ✅ Member added/removed
- ✅ Settlement recorded
- ✅ Balances recalculated

### Balance Calculation

Balances are automatically recalculated and broadcast when:
1. An expense is added, modified, or removed
2. A member joins or leaves the group
3. A payment is settled

Formula:
```
Balance = (Paid - Share) + (Received - Paid in Settlements)
```

## Event Examples

### Creating an Expense

**Client:**
```typescript
createExpense({
  description: 'Groceries',
  amount: 150.50,
  paidBy: 'user-123',
  date: new Date(),
  category: 'Food'
});
```

**Server broadcasts:**
```typescript
io.to(groupId).emit('expense_created', expenseData);
io.to(groupId).emit('balances_updated', balances);
```

**Client receives:**
```typescript
socket.on('expense_created', (expense) => {
  // Update UI with new expense
});

socket.on('balances_updated', (balances) => {
  // Update UI with new balances
});
```

## Testing During Development

### 1. Enable Test Utils

Add to `app/layout.tsx`:

```typescript
import { exposeTestUtils } from '@/lib/socket/testing';

useEffect(() => {
  if (process.env.NODE_ENV === 'development') {
    exposeTestUtils();
  }
}, []);
```

### 2. Open Browser Console

```javascript
// Create a socket connection
const socket = window.socketTest.createSocket();

// Join a group
window.socketTest.joinGroup(socket, 'group-123');

// Create a test expense
window.socketTest.createExpense(socket, {
  groupId: 'group-123',
  description: 'Test',
  amount: 100,
  paidBy: 'user-123'
});

// Run full test suite
window.socketTest.runSuite('group-123', 'user-123');
```

## Common Patterns

### 1. Loading State

```typescript
const { isConnected, balances } = useGroupSocket(groupId);

if (!isConnected) {
  return <LoadingSpinner />;
}

// Show data
```

### 2. Error Handling

```typescript
useEffect(() => {
  socket?.on('error', (error) => {
    toast.error(error.message);
  });
}, [socket]);
```

### 3. Optimistic Updates

```typescript
const handleAddExpense = async () => {
  // Optimistically update UI
  setExpenses(prev => [...prev, optimisticExpense]);

  // Send to server
  createExpense(expenseData);

  // If server confirms, optimistic update is replaced
  socket.on('expense_created', (realExpense) => {
    setExpenses(prev =>
      prev.map(e => e.id === realExpense.id ? realExpense : e)
    );
  });
};
```

## Production Checklist

- [ ] Environment variables set
- [ ] Database tables created
- [ ] Custom server in production
- [ ] CORS configured correctly
- [ ] WebSocket enabled on load balancer
- [ ] Error monitoring setup
- [ ] Rate limiting considered

## Troubleshooting

### Issue: "Not a member of this group"

**Solution:** Verify user is in `group_members` table:
```sql
SELECT * FROM group_members WHERE group_id = ? AND user_id = ?
```

### Issue: Balances don't update

**Solution:** Check console for calculation errors:
```javascript
// In browser console
socket.on('balances_updated', console.log);
```

### Issue: Connection drops frequently

**Solution:**
1. Check network stability
2. Verify WebSocket support
3. Check load balancer timeout settings
4. Review server logs

## Performance Tips

1. **Batch updates:** Group multiple expense additions
2. **Lazy loading:** Only join rooms when viewing groups
3. **Debounce inputs:** For expense updates
4. **Pagination:** For large expense lists

## Security Notes

1. ✅ Authentication via NextAuth
2. ✅ Room membership verified
3. ✅ Database permissions checked
4. ✅ Input validation on all events
5. ⚠️ Use HTTPS in production
6. ⚠️ Implement rate limiting

## Next Steps

1. Set up database tables (see SOCKET_SETUP.md)
2. Configure NextAuth with proper session handling
3. Test with browser console utilities
4. Build your UI components using the hooks
5. Deploy with custom server

## Resources

- [Socket.io Documentation](https://socket.io/docs/)
- [Next.js Custom Server](https://nextjs.org/docs/pages/building-your-application/configuring/custom-server)
- [React Hooks Guide](https://react.dev/reference/react)
