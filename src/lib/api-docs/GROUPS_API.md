# Group Management API Documentation

## Overview
This document describes the group management system APIs for the expense-sharing application. The system allows users to create groups, manage members, send invitations, and handle group administration.

## Base URL
```
/api/groups
```

## Authentication
All endpoints require authentication via NextAuth.js. Include the session cookie or JWT token in your requests.

---

## Groups API

### GET /api/groups
Get all groups for the current user.

**Response:**
```json
{
  "groups": [
    {
      "id": "uuid",
      "name": "Roommates",
      "description": "Apartment expenses",
      "created_by": "user-uuid",
      "created_at": 1234567890,
      "updated_at": 1234567890,
      "memberCount": 3,
      "pendingInvitations": 1,
      "currentUserRole": "admin"
    }
  ]
}
```

### POST /api/groups
Create a new group.

**Request Body:**
```json
{
  "name": "Roommates",
  "description": "Apartment expenses"
}
```

**Validation:**
- `name`: Required, string, 1-100 characters
- `description`: Optional, string, max 500 characters

**Response:**
```json
{
  "group": {
    "id": "uuid",
    "name": "Roommates",
    "description": "Apartment expenses",
    "created_by": "user-uuid",
    "created_at": 1234567890,
    "updated_at": 1234567890,
    "memberCount": 1,
    "pendingInvitations": 0,
    "currentUserRole": "admin"
  }
}
```

---

## Single Group API

### GET /api/groups/[id]
Get details of a specific group.

**Response:**
```json
{
  "group": {
    "id": "uuid",
    "name": "Roommates",
    "description": "Apartment expenses",
    "created_by": "user-uuid",
    "created_at": 1234567890,
    "updated_at": 1234567890,
    "memberCount": 3,
    "pendingInvitations": 1,
    "currentUserRole": "admin"
  }
}
```

**Errors:**
- `401`: Unauthorized
- `403`: Not a member of this group
- `404`: Group not found

### PATCH /api/groups/[id]
Update group details. Only admins can update.

**Request Body:**
```json
{
  "name": "New Name",
  "description": "New description"
}
```

**Response:**
```json
{
  "group": { /* updated group object */ }
}
```

**Errors:**
- `401`: Unauthorized
- `403`: Not an admin
- `404`: Group not found
- `400`: Validation error

### DELETE /api/groups/[id]
Delete a group. Only admins can delete.

**Response:**
```json
{
  "message": "Group deleted successfully"
}
```

**Errors:**
- `401`: Unauthorized
- `403`: Not an admin
- `404`: Group not found

---

## Members API

### GET /api/groups/[id]/members
Get all members of a group.

**Response:**
```json
{
  "members": [
    {
      "id": "member-uuid",
      "group_id": "group-uuid",
      "user_id": "user-uuid",
      "role": "admin",
      "status": "active",
      "joined_at": 1234567890,
      "updated_at": 1234567890
    }
  ]
}
```

### POST /api/groups/[id]/members
Add a member directly (for registered users). Only admins can add.

**Request Body:**
```json
{
  "userId": "user-uuid",
  "role": "member"
}
```

**Validation:**
- `userId`: Required, string
- `role`: Optional, enum: `admin` or `member` (default: `member`)

**Response:**
```json
{
  "member": { /* member object */ }
}
```

**Errors:**
- `409`: User is already a member

### PATCH /api/groups/[id]/members
Update a member's role. Only admins can update roles.

**Request Body:**
```json
{
  "memberId": "member-uuid",
  "role": "admin"
}
```

**Response:**
```json
{
  "member": { /* updated member object */ }
}
```

**Errors:**
- `400`: Cannot demote the last admin

### DELETE /api/groups/[id]/members?userId=[userId]
Remove a member from the group.

**Parameters:**
- `userId`: User ID to remove (required)

**Response:**
```json
{
  "message": "Member removed successfully"
}
```

**Rules:**
- Admins can remove any member
- Members can remove themselves
- Cannot remove the last admin

---

## Invitations API

### GET /api/groups/[id]/members/invite
Get all pending invitations for a group.

**Response:**
```json
{
  "invitations": [
    {
      "id": "invitation-uuid",
      "group_id": "group-uuid",
      "email": "user@example.com",
      "invited_by": "user-uuid",
      "status": "pending",
      "created_at": 1234567890,
      "expires_at": 1234567890,
      "updated_at": 1234567890
    }
  ]
}
```

### POST /api/groups/[id]/members/invite
Invite a member to the group. Only admins can invite.

**Request Body:**
```json
{
  "email": "user@example.com",
  "expiresInHours": 48
}
```

**Validation:**
- `email`: Required, valid email format
- `expiresInHours`: Optional, 1-168 hours (1 hour to 1 week), default: 48

**Response:**
```json
{
  "invitation": { /* invitation object */ },
  "message": "Invitation created successfully",
  "inviteLink": "http://localhost:3000/invite/invitation-uuid"
}
```

### PATCH /api/groups/[id]/members/invite
Resend an invitation with extended expiration.

**Request Body:**
```json
{
  "invitationId": "invitation-uuid",
  "expiresInHours": 48
}
```

**Response:**
```json
{
  "invitation": { /* updated invitation object */ },
  "message": "Invitation resent successfully",
  "inviteLink": "http://localhost:3000/invite/invitation-uuid"
}
```

### DELETE /api/groups/[id]/members/invite?invitationId=[id]
Cancel an invitation.

**Parameters:**
- `invitationId`: Invitation ID to cancel (required)

**Response:**
```json
{
  "message": "Invitation canceled successfully"
}
```

---

## User Invitations API

### GET /api/invitations
Get all pending invitations for the current user.

**Response:**
```json
{
  "invitations": [
    {
      "id": "invitation-uuid",
      "group_id": "group-uuid",
      "group_name": "Roommates",
      "group_description": "Apartment expenses",
      "email": "user@example.com",
      "invited_by": "user-uuid",
      "status": "pending",
      "created_at": 1234567890,
      "expires_at": 1234567890,
      "updated_at": 1234567890
    }
  ]
}
```

### GET /api/invitations/[id]
Get details of a specific invitation.

**Response:**
```json
{
  "invitation": {
    "id": "invitation-uuid",
    "group_id": "group-uuid",
    "group_name": "Roommates",
    "group_description": "Apartment expenses",
    "invited_by": "user-uuid",
    "created_at": 1234567890,
    "expires_at": 1234567890
  }
}
```

**Errors:**
- `403`: This invitation is not for your account
- `410`: Invitation has expired

### POST /api/invitations/[id]
Accept an invitation and join the group.

**Response:**
```json
{
  "message": "Successfully joined the group",
  "member": { /* member object */ },
  "group": { /* group object */ }
}
```

**Errors:**
- `409`: Already a member of this group
- `410`: Invitation has expired

### DELETE /api/invitations/[id]
Decline an invitation.

**Response:**
```json
{
  "message": "Invitation declined successfully"
}
```

---

## Error Responses

All endpoints may return these error responses:

### 400 Bad Request
```json
{
  "error": "Validation error message",
  "details": "Specific error details"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "error": "Permission denied message"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Error message",
  "details": "Specific error details"
}
```

---

## Database Schema

### Groups Table
```sql
CREATE TABLE groups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_by TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (created_by) REFERENCES users(id)
);
```

### Group Members Table
```sql
CREATE TABLE group_members (
  id TEXT PRIMARY KEY,
  group_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  status TEXT NOT NULL DEFAULT 'active',
  joined_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (group_id) REFERENCES groups(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE(group_id, user_id)
);
```

### Group Invitations Table
```sql
CREATE TABLE group_invitations (
  id TEXT PRIMARY KEY,
  group_id TEXT NOT NULL,
  email TEXT NOT NULL,
  invited_by TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (group_id) REFERENCES groups(id),
  FOREIGN KEY (invited_by) REFERENCES users(id),
  UNIQUE(group_id, email, status)
);
```

---

## Permissions Summary

| Action | Member | Admin |
|--------|--------|-------|
| View group | ✅ | ✅ |
| Update group | ❌ | ✅ |
| Delete group | ❌ | ✅ |
| View members | ✅ | ✅ |
| Add member | ❌ | ✅ |
| Remove member (self) | ✅ | ✅ |
| Remove member (others) | ❌ | ✅ |
| Update member role | ❌ | ✅ |
| View invitations | ✅ | ✅ |
| Create invitation | ❌ | ✅ |
| Cancel invitation | ❌ | ✅ |
| Accept invitation | ✅ | ✅ |
| Decline invitation | ✅ | ✅ |
