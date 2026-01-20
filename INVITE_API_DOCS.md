# Member Invitation System API Documentation

This document describes the member invitation system API routes for the expense-sharing application.

## Database Tables Required

### `group_invites`
```sql
CREATE TABLE group_invites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  group_id TEXT NOT NULL,
  email TEXT NOT NULL,
  invite_code TEXT NOT NULL UNIQUE,
  invited_by TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  expires_at TEXT,
  FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE
);
```

### `group_members`
```sql
CREATE TABLE group_members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  group_id TEXT NOT NULL,
  user_email TEXT NOT NULL,
  role TEXT DEFAULT 'member',
  joined_at TEXT DEFAULT CURRENT_TIMESTAMP,
  balance REAL DEFAULT 0.0,
  FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
  UNIQUE(group_id, user_email)
);
```

---

## API Routes

### 1. Create Invitation (POST `/api/groups/[id]/invite`)

Generates an invite code and sends an email invitation.

**Endpoint:** `POST /api/groups/{groupId}/invite`

**Authentication:** Required (NextAuth session)

**Request Body:**
```json
{
  "email": "friend@example.com"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Invitation sent successfully",
  "inviteCode": "a1b2c3d4e5f6...",
  "inviteUrl": "http://localhost:3000/groups/abc123/invite/a1b2c3d4e5f6..."
}
```

**Error Responses:**
- `400`: Email is required
- `400`: User is already a member
- `401`: Unauthorized
- `403`: You are not a member of this group
- `500`: Failed to create invitation

**Features:**
- Generates unique 64-character invite code using crypto
- Reuses existing pending invites if found
- Automatically sends email with invite link
- 7-day expiration

---

### 2. Get Pending Invites (GET `/api/groups/[id]/invite`)

Retrieves all pending invitations for a group.

**Endpoint:** `GET /api/groups/{groupId}/invite`

**Authentication:** Required

**Success Response (200):**
```json
{
  "invites": [
    {
      "id": 1,
      "email": "friend@example.com",
      "invite_code": "a1b2c3d4e5f6...",
      "invited_by": "user@example.com",
      "created_at": "2024-01-15T10:30:00.000Z",
      "expires_at": null
    }
  ]
}
```

---

### 3. Validate Invite Code (GET `/api/groups/[id]/invite/[code]`)

Validates an invite code before user accepts it.

**Endpoint:** `GET /api/groups/{groupId}/invite/{inviteCode}`

**Authentication:** Required

**Success Response (200):**
```json
{
  "valid": true,
  "groupId": "abc123",
  "groupName": "Trip to Paris",
  "inviterEmail": "user@example.com",
  "inviteeEmail": "friend@example.com",
  "message": "Invitation valid. You can join this group."
}
```

**Already Member Response (200):**
```json
{
  "valid": true,
  "alreadyMember": true,
  "groupId": "abc123",
  "groupName": "Trip to Paris",
  "message": "You are already a member of this group"
}
```

**Error Responses:**
- `401`: You must be logged in to accept an invitation
- `403`: Invitation was sent to a different email
- `404`: Invalid invitation code
- `410`: This invitation has expired

---

### 4. Accept Invitation (POST `/api/groups/[id]/members/[memberId]/accept`)

Accepts an invitation and joins the group.

**Endpoint:** `POST /api/groups/{groupId}/members/{inviteCode}/accept`

**Authentication:** Required

**Note:** The `memberId` parameter is actually the `inviteCode`

**Success Response (200):**
```json
{
  "success": true,
  "groupId": "abc123",
  "groupName": "Trip to Paris",
  "userId": 5,
  "role": "member",
  "message": "Successfully joined the group"
}
```

**Error Responses:**
- `400`: Invalid invitation code
- `400`: You are already a member of this group
- `403`: This invitation was sent to a different email address
- `410`: This invitation has expired
- `500`: Failed to accept invitation

**Features:**
- Uses database transaction for atomicity
- Automatically deletes used invite
- Sets member role to 'member'
- Initializes balance to 0

---

### 5. Remove Member (DELETE `/api/groups/[id]/members/[memberId]`)

Removes a member from a group or leaves a group.

**Endpoint:** `DELETE /api/groups/{groupId}/members/{memberId}`

**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "removedMemberEmail": "friend@example.com",
  "removedBy": "user@example.com",
  "message": "Successfully removed friend@example.com from the group"
}
```

**Error Responses:**
- `401`: Unauthorized
- `403`: You are not a member of this group
- `403`: You do not have permission to remove this member
- `404`: Member not found
- `400`: Cannot remove the group creator
- `500`: Failed to remove member

**Permissions:**
- Group creator can remove anyone (except themselves)
- Admins can remove regular members
- Members can remove themselves (leave group)

**Features:**
- Cascades to delete expense splits
- Uses database transaction
- Prevents removing group creator

---

### 6. Get Member Details (GET `/api/groups/[id]/members/[memberId]`)

Gets detailed information about a group member.

**Endpoint:** `GET /api/groups/{groupId}/members/{memberId}`

**Authentication:** Required

**Success Response (200):**
```json
{
  "member": {
    "id": 5,
    "email": "friend@example.com",
    "role": "member",
    "joinedAt": "2024-01-15T10:35:00.000Z",
    "balance": -25.50,
    "expenseSummary": {
      "totalExpenses": 3,
      "totalSpent": 150.00
    }
  }
}
```

---

### 7. Update Member Role (PATCH `/api/groups/[id]/members/[memberId]`)

Updates a member's role (admin or member).

**Endpoint:** `PATCH /api/groups/{groupId}/members/{memberId}`

**Authentication:** Required (admin or creator only)

**Request Body:**
```json
{
  "role": "admin"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Member role updated to admin",
  "email": "friend@example.com",
  "newRole": "admin"
}
```

**Error Responses:**
- `400`: Invalid role. Must be "admin" or "member"
- `400`: Cannot change the group creator's role
- `403`: You do not have permission to update member roles
- `404`: Member not found

---

### 8. Revoke Invitation (DELETE `/api/groups/[id]/invite/[code]`)

Revokes a pending invitation.

**Endpoint:** `DELETE /api/groups/{groupId}/invite/{inviteCode}`

**Authentication:** Required (group members only)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Invitation revoked successfully"
}
```

---

## Usage Examples

### Frontend: Create Invite
```typescript
const response = await fetch(`/api/groups/${groupId}/invite`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'friend@example.com' })
});
const data = await response.json();
```

### Frontend: Accept Invite
```typescript
const response = await fetch(`/api/groups/${groupId}/members/${inviteCode}/accept`, {
  method: 'POST'
});
const data = await response.json();
```

### Frontend: Remove Member
```typescript
const response = await fetch(`/api/groups/${groupId}/members/${memberId}`, {
  method: 'DELETE'
});
const data = await response.json();
```

---

## Email Integration

The system includes a placeholder email function that logs to console in development.

To integrate with an email service (e.g., Resend):

1. Install the package:
```bash
npm install resend
```

2. Update the `.env` file:
```
RESEND_API_KEY=re_xxxxxxxxxxxxx
NEXTAUTH_URL=https://yourdomain.com
```

3. Uncomment the Resend code in `src/lib/invites.ts`

---

## Socket.io Integration

The API includes commented-out Socket.io event emitters for real-time updates:

- `member:joined` - When a new member accepts an invite
- `member:removed` - When a member is removed
- `member:updated` - When a member's role changes

To enable, uncomment the Socket.io code in the route files and set up your Socket.io server.
