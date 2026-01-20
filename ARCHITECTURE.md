# Socket.io Architecture Diagram

## Flow Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Side                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐  │
│  │   Browser    │      │   Socket     │      │    React     │  │
│  │   (Next.js)  │◄────►│   .client    │◄────►│   Components │  │
│  └──────────────┘      └──────────────┘      └──────────────┘  │
│         ▲                       │                       ▲       │
│         │                       │                       │       │
└─────────┼───────────────────────┼───────────────────────┼───────┘
          │                       │                       │
          │ WebSocket             │ Events                │ Hooks
          │                       │                       │
┌─────────┼───────────────────────┼───────────────────────┼───────┐
│         │                       │                       │       │
│         ▼                       ▼                       ▼       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    Socket.io Server                       │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │                                                            │   │
│  │  ┌──────────────────┐      ┌────────────────────────┐   │   │
│  │  │  Authentication   │      │    Connection Manager  │   │   │
│  │  │   Middleware      │─────►│    (Rooms, Events)     │   │   │
│  │  └──────────────────┘      └────────────────────────┘   │   │
│  │                                       │                    │   │
│  │  ┌─────────────────────────────────────┼──────────────┐  │   │
│  │  │                                     ▼              │  │   │
│  │  │                          ┌─────────────────────┐   │  │   │
│  │  │                          │   Event Handlers    │   │  │   │
│  │  │                          ├─────────────────────┤   │  │   │
│  │  │                          │ • Group Handler     │   │  │   │
│  │  │                          │ • Expense Handler   │   │  │   │
│  │  │                          │ • Member Handler    │   │  │   │
│  │  │                          │ • Settlement Handler│   │  │   │
│  │  │                          └─────────────────────┘   │  │   │
│  │  │                                     │              │  │   │
│  │  └─────────────────────────────────────┼──────────────┘  │   │
│  │                                        │                   │   │
│  │                                        ▼                   │   │
│  │                          ┌─────────────────────┐          │   │
│  │                          │   SQLite Database    │          │   │
│  │                          │ • groups             │          │   │
│  │                          │ • group_members      │          │   │
│  │                          │ • expenses           │          │   │
│  │                          │ • settlements        │          │   │
│  │                          └─────────────────────┘          │   │
│  │                                                            │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

## Event Flow Examples

### Creating an Expense

```
1. User Action (React Component)
   └─► createExpense({ description, amount, paidBy })
       │
2. Socket Emit (Client)
   └─► socket.emit('create_expense', payload)
       │
3. Server Receive (server.ts)
   └─► Handle in expense-handler.ts
       │
4. Database Operation
   ├─► INSERT INTO expenses
   ├─► Calculate splits
   └─► Get updated balances
       │
5. Broadcast to Room
   ├─► io.to(groupId).emit('expense_created', data)
   └─► io.to(groupId).emit('balances_updated', balances)
       │
6. Client Receive
   ├─► socket.on('expense_created') → Update expenses list
   └─► socket.on('balances_updated') → Update balances display
       │
7. UI Update (React)
   └─► Re-render with new data
```

### Adding a Group Member

```
1. User Action
   └─► addMember(email)
       │
2. Socket Emit
   └─► socket.emit('add_member', { groupId, email })
       │
3. Server Handler (group-handler.ts)
   ├─► Verify permissions
   ├─► Find user by email
   ├─► Add to group_members table
   └─► Get updated group data
       │
4. Broadcast Events
   ├─► io.to(groupId).emit('member_added', memberData)
   ├─► io.to(groupId).emit('group_updated', groupData)
   └─► io.to(groupId).emit('balances_updated', newBalances)
       │
5. Client Updates
   └─► All members see new member instantly
```

### Real-time Balance Updates

```
Balance Recalculation Triggered By:
  ├─► Expense created/updated/deleted
  ├─► Member added/removed
  └─► Settlement recorded

Calculation (group-handler.ts):
  ├─► For each member:
  │   ├─► Sum of paid expenses
  │   ├─► Share of total (total / memberCount)
  │   ├─► Settlements received/paid
  │   └─► balance = paid - share + received - paid_out
  │
  ├─► Calculate debt chains:
  │   ├─► Debtors (balance < 0)
  │   ├─► Creditors (balance > 0)
  │   └─► Match amounts owed
  │
  └─► Broadcast to all members in room
```

## Room Structure

```
Socket.io Rooms
│
├─► group-123
│   ├─► socket-1 (User A)
│   ├─► socket-2 (User B)
│   └─► socket-3 (User C)
│
├─► group-456
│   ├─► socket-2 (User B)  [Can be in multiple rooms]
│   └─► socket-4 (User D)
│
└─► No room (individual socket)
    └─► socket-5 (User E, not viewing any group)
```

## Key Components

### Server Side

1. **server.ts** - Main server initialization
   - Socket.io setup
   - Authentication middleware
   - Connection handler
   - Error handling

2. **handlers/group-handler.ts**
   - join_group / leave_group
   - add_member / remove_member
   - Balance calculations
   - Group data retrieval

3. **handlers/expense-handler.ts**
   - create_expense / update_expense / delete_expense
   - settle_up
   - Automatic balance updates

### Client Side

1. **client.ts** - React hooks
   - useSocket() - Basic connection
   - useGroupSocket() - Group-specific
   - useDashboardSocket() - Dashboard-wide

2. **events.ts** - Type definitions
   - Event names
   - Payload types
   - Response types

## Data Flow

```
User Action → React Hook → Socket Emit → Server Handler
                                                      │
                                                      ▼
                                             Database Operation
                                                      │
                                                      ▼
                                             Calculate Updates
                                                      │
                                                      ▼
                                        Broadcast to Room (io.to)
                                                      │
                                                      ▼
                              All Clients in Room Receive Event
                                                      │
                                                      ▼
                                     React State Update & Re-render
```

## Security Layers

```
1. Connection Level
   └─► NextAuth session token verification

2. Room Level
   └─► Verify group membership before joining

3. Event Level
   └─► Check permissions for each action

4. Database Level
   └─► SQL constraints and foreign keys
```

## Performance Considerations

```
✅ Room-based broadcasting (not to all clients)
✅ Efficient SQL queries with aggregations
✅ Automatic reconnection with backoff
✅ Minimal data transfer (only changes)

⚠️ Consider for large groups:
   • Pagination for expenses
   • Debouncing balance updates
   • Virtual scrolling for lists
```

## Error Handling

```
Client Error
    │
    ├─► socket.emit('error') → Server logs
    │
    ├─► socket.on('error') → UI notification
    │
    └─► Automatic reconnection on disconnect
```

## Testing Strategy

```
1. Unit Tests
   └─► Test handlers in isolation

2. Integration Tests
   └─► Test full event flows

3. Manual Testing
   └─► Browser console (testing.ts)

4. Load Testing
   └─► Multiple concurrent users
```

## Deployment Checklist

```
Server:
  ☑️ Custom server.js running
  ☑️ Environment variables set
  ☑️ Database tables created
  ☑️ CORS configured
  ☑️ WebSocket support enabled

Client:
  ☑️ Socket.io-client installed
  ☑️ Hooks integrated in components
  ☑️ Error handling added
  ☑️ Loading states implemented
  ☑️ Connection status displayed
```
