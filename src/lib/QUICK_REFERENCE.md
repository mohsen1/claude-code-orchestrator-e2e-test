# Group Management System - Quick Reference

## Import Examples

```typescript
// Database operations
import { GroupsDatabase } from '@/lib/db/groups';
import { getDb } from '@/lib/db';

// Types
import type { Group, GroupMember, GroupInvitation } from '@/lib/types/groups';

// Utilities
import {
  hasGroupPermission,
  validateGroupName,
  validateEmail,
  formatGroupResponse
} from '@/lib/utils/groups';
```

## Common Usage Patterns

### Initialize Database
```typescript
import { getDb } from '@/lib/db';
import { GroupsDatabase } from '@/lib/db/groups';

const db = getDb();
const groupsDb = new GroupsDatabase(db);
```

### Create a Group
```typescript
const group = groupsDb.createGroup({
  name: 'Roommates',
  description: 'Apartment expenses',
  created_by: userId,
});
```

### Check Permissions
```typescript
import { hasGroupPermission } from '@/lib/utils/groups';

if (hasGroupPermission(groupsDb, groupId, userId, 'admin')) {
  // User is admin, allow action
}
```

### Invite a Member
```typescript
const invitation = groupsDb.createInvitation(
  groupId,
  'user@example.com',
  invitedByUserId,
  48 // hours until expiration
);
```

### Accept Invitation
```typescript
const member = groupsDb.acceptInvitation(invitationId, userId);
if (member) {
  // Successfully joined
}
```

### Get User's Groups
```typescript
const groups = groupsDb.getGroupsByUserId(userId);
```

### Update Member Role
```typescript
const updated = groupsDb.updateMemberRole(memberId, 'admin');
```

## API Response Formats

### Group Response
```json
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
```

### Member Response
```json
{
  "id": "member-uuid",
  "group_id": "group-uuid",
  "user_id": "user-uuid",
  "role": "admin",
  "status": "active",
  "joined_at": 1234567890,
  "updated_at": 1234567890
}
```

### Invitation Response
```json
{
  "id": "invite-uuid",
  "group_id": "group-uuid",
  "email": "user@example.com",
  "invited_by": "user-uuid",
  "status": "pending",
  "created_at": 1234567890,
  "expires_at": 1234567890,
  "updated_at": 1234567890
}
```

## Validation Rules

| Field | Rules |
|-------|-------|
| Group name | Required, 1-100 characters |
| Group description | Optional, max 500 characters |
| Email | Valid email format |
| Expiration hours | 1-168 (1 hour to 1 week) |
| Role | 'admin' or 'member' |
| Status | 'active', 'pending', 'removed', 'accepted', 'declined', 'expired' |

## Error Handling

```typescript
try {
  const group = groupsDb.getGroupById(groupId);
  if (!group) {
    return NextResponse.json(
      { error: 'Group not found' },
      { status: 404 }
    );
  }
} catch (error) {
  return NextResponse.json(
    { error: 'Operation failed', details: error.message },
    { status: 500 }
  );
}
```

## HTTP Status Codes

| Code | Usage |
|------|-------|
| 200 | Success |
| 201 | Created |
| 400 | Bad request (validation error) |
| 401 | Unauthorized |
| 403 | Forbidden (permission denied) |
| 404 | Not found |
| 409 | Conflict (duplicate) |
| 410 | Gone (expired) |
| 500 | Server error |

## Database Query Examples

```typescript
// Get all members
const members = groupsDb.getGroupMembers(groupId);

// Check if user is admin
const isAdmin = groupsDb.isUserGroupAdmin(groupId, userId);

// Get group stats
const stats = groupsDb.getGroupStats(groupId);
// { memberCount: 3, pendingInvitations: 1 }

// Get pending invitations
const invites = groupsDb.getInvitationsByGroupId(groupId);

// Get user's invitations
const userInvites = groupsDb.getInvitationsByEmail('user@example.com');
```

## Permission Matrix

| Action | Member | Admin |
|--------|--------|-------|
| View group | ✅ | ✅ |
| Update group | ❌ | ✅ |
| Delete group | ❌ | ✅ |
| View members | ✅ | ✅ |
| Add members | ❌ | ✅ |
| Remove others | ❌ | ✅ |
| Remove self | ✅ | ✅ |
| Change roles | ❌ | ✅ |
| Invite members | ❌ | ✅ |
| Accept invite | ✅ | ✅ |

## Common Workflows

### 1. User Creates a Group
```
POST /api/groups
→ Creates group
→ Adds user as admin member
→ Returns group with stats
```

### 2. Admin Invites Someone
```
POST /api/groups/[id]/members/invite
→ Creates invitation
→ Returns invite link
→ (Send email with link)
```

### 3. User Accepts Invitation
```
POST /api/invitations/[id]
→ Validates invitation
→ Adds user as member
→ Updates invitation status
→ Returns member + group
```

### 4. Admin Promotes Member
```
PATCH /api/groups/[id]/members
→ Updates member.role to 'admin'
→ Validates not last admin
→ Returns updated member
```

### 5. Member Leaves Group
```
DELETE /api/groups/[id]/members?userId=self
→ Validates not last admin
→ Sets member.status to 'removed'
→ Returns success
```

## Testing with cURL

```bash
# Create group
curl -X POST http://localhost:3000/api/groups \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Group","description":"Testing"}'

# Get groups
curl http://localhost:3000/api/groups

# Invite member
curl -X POST http://localhost:3000/api/groups/[id]/members/invite \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","expiresInHours":48}'

# Accept invitation
curl -X POST http://localhost:3000/api/invitations/[id]

# Update member role
curl -X PATCH http://localhost:3000/api/groups/[id]/members \
  -H "Content-Type: application/json" \
  -d '{"memberId":"member-id","role":"admin"}'
```

## Environment Variables

```env
DATABASE_PATH=./data/expenses.db
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```
