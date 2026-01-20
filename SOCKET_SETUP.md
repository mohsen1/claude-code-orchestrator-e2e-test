# Socket.io Server Implementation

This implementation provides real-time functionality for the expense-sharing app using Socket.io.

## Architecture

### Server Components

1. **`src/lib/socket/server.ts`** - Main Socket.io server initialization
   - Authentication middleware using NextAuth sessions
   - Connection management
   - Event routing to handlers
   - Helper functions for broadcasting

2. **`src/lib/socket/handlers/group-handler.ts`** - Group-related events
   - Join/leave group rooms
   - Add/remove members
   - Group data retrieval
   - Balance calculations

3. **`src/lib/socket/handlers/expense-handler.ts`** - Expense-related events
   - Create/update/delete expenses
   - Settlement handling
   - Automatic balance recalculations

4. **`src/lib/socket/events.ts`** - Type definitions and event names
   - Client-to-server events
   - Server-to-client events
   - Payload and response types

### Client Components

1. **`src/lib/socket/client.ts`** - React hooks for Socket.io
   - `useSocket()` - Basic socket connection
   - `useGroupSocket(groupId)` - Group-specific events
   - `useDashboardSocket()` - Dashboard-wide events

## Features

### Real-time Events

#### Group Events
- **JOIN_GROUP** - User joins a group room
- **LEAVE_GROUP** - User leaves a group room
- **GROUP_CREATED** - New group created
- **GROUP_UPDATED** - Group information changed
- **GROUP_DELETED** - Group deleted

#### Expense Events
- **CREATE_EXPENSE** - New expense added
- **UPDATE_EXPENSE** - Expense modified
- **DELETE_EXPENSE** - Expense removed
- **EXPENSE_CREATED** - Broadcast when expense is created
- **EXPENSE_UPDATED** - Broadcast when expense is updated
- **EXPENSE_DELETED** - Broadcast when expense is deleted

#### Member Events
- **ADD_MEMBER** - Add user to group
- **REMOVE_MEMBER** - Remove user from group
- **MEMBER_ADDED** - Broadcast when member joins
- **MEMBER_REMOVED** - Broadcast when member leaves

#### Balance Events
- **BALANCES_UPDATED** - Automatic recalculation broadcast

#### Settlement Events
- **SETTLE_UP** - Record a payment between users
- **SETTLEMENT_CREATED** - Broadcast when settlement is recorded

## Setup

### 1. Install Dependencies

Dependencies are already in `package.json`:
```json
{
  "socket.io": "^4.8.1",
  "socket.io-client": "^4.8.1"
}
```

### 2. Database Tables

Ensure your database has these tables:

```sql
-- Groups table
CREATE TABLE IF NOT EXISTS groups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Group members table
CREATE TABLE IF NOT EXISTS group_members (
  id TEXT PRIMARY KEY,
  group_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  joined_at TEXT NOT NULL,
  FOREIGN KEY (group_id) REFERENCES groups(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE(group_id, user_id)
);

-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  group_id TEXT NOT NULL,
  description TEXT NOT NULL,
  amount REAL NOT NULL,
  paid_by TEXT NOT NULL,
  date TEXT NOT NULL,
  category TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (group_id) REFERENCES groups(id),
  FOREIGN KEY (paid_by) REFERENCES users(id)
);

-- Settlements table
CREATE TABLE IF NOT EXISTS settlements (
  id TEXT PRIMARY KEY,
  group_id TEXT NOT NULL,
  from_user_id TEXT NOT NULL,
  to_user_id TEXT NOT NULL,
  amount REAL NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (group_id) REFERENCES groups(id),
  FOREIGN KEY (from_user_id) REFERENCES users(id),
  FOREIGN KEY (to_user_id) REFERENCES users(id)
);
```

### 3. Run the Server

Instead of using `next dev`, use the custom server:

```bash
# Development
NODE_ENV=development node server.js

# Production
NODE_ENV=production node server.js

# Or add to package.json scripts:
"dev": "NODE_ENV=development node server.js",
"build": "next build",
"start": "NODE_ENV=production node server.js"
```

## Usage Examples

### Server-side (API Routes)

```typescript
import { getSocketIO } from '@/lib/socket';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { groupId, name } = req.body;

    // Create group in database...

    // Broadcast to all connected clients
    const io = getSocketIO();
    io?.to(groupId).emit('group_updated', { id: groupId, name });

    res.status(200).json({ success: true });
  }
}
```

### Client-side (React Components)

```typescript
import { useGroupSocket } from '@/lib/socket/client';

function GroupDetail({ groupId }: { groupId: string }) {
  const {
    isConnected,
    groupData,
    balances,
    expenses,
    members,
    createExpense,
    updateExpense,
    deleteExpense,
  } = useGroupSocket(groupId);

  const handleAddExpense = () => {
    createExpense({
      description: 'Dinner',
      amount: 100,
      paidBy: userId,
      date: new Date(),
      category: 'Food',
    });
  };

  return (
    <div>
      <p>Status: {isConnected ? 'Connected' : 'Disconnected'}</p>
      {/* Render group data, balances, expenses, etc. */}
    </div>
  );
}
```

## Balance Calculation Logic

The server automatically calculates balances when:
1. An expense is created/updated/deleted
2. A member is added/removed
3. A settlement is recorded

Balance formula:
```
Balance = (Amount Paid - Share of Total Expenses) + (Received in Settlements - Paid in Settlements)

Where:
- Share of Total Expenses = Total Expenses / Number of Members
```

## Room Structure

- Each group has its own room (named by `groupId`)
- Users join a group's room when they view that group
- Events are broadcast only to relevant group members
- Users can be in multiple group rooms simultaneously

## Security

- Authentication via NextAuth session tokens
- Users can only join rooms for groups they are members of
- All database operations verify user permissions
- Socket connections require valid session

## Error Handling

All errors are emitted to clients with format:
```typescript
{
  message: string,
  error?: string
}
```

Clients should listen for the 'error' event:
```typescript
socket.on('error', (error) => {
  console.error('Socket error:', error.message);
});
```

## Testing

You can test the socket connection using the browser console:

```javascript
// Connect to socket
const socket = io({
  path: '/api/socket',
  auth: { token: 'your-session-token' }
});

// Join a group
socket.emit('join_group', { groupId: 'group-123' });

// Listen for events
socket.on('balances_updated', (balances) => {
  console.log('Balances updated:', balances);
});
```

## Performance Considerations

- Uses WebSocket with fallback to HTTP long-polling
- Automatic reconnection with exponential backoff
- Room-based broadcasting prevents unnecessary messages
- Balance calculations are optimized with SQL aggregations
- SQLite WAL mode for better concurrency

## Troubleshooting

### Connection Issues

1. Check that the custom server is running
2. Verify NextAuth session is valid
3. Check browser console for authentication errors
4. Ensure database is accessible

### Events Not Received

1. Verify user has joined the group room
2. Check that user is a member of the group
3. Look for errors in server logs
4. Test with browser console directly

### Balance Mismatches

1. Check database integrity
2. Verify all expenses are recorded
3. Check for orphaned settlement records
4. Review member list accuracy
