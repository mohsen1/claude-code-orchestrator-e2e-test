# Group Management System

A complete group management system for the expense-sharing app with TypeScript types, database schema, and CRUD operations.

## Database Schema

### Groups Table (`groups`)
- `id`: Auto-incrementing primary key
- `name`: Group name (required)
- `description`: Optional group description
- `created_by`: User ID of the creator
- `created_at`: Timestamp of creation
- `updated_at`: Timestamp of last update

### Group Members Table (`group_members`)
- `id`: Auto-incrementing primary key
- `group_id`: Foreign key to groups table
- `user_id`: User ID of the member
- `role`: Either 'admin' or 'member' (default: 'member')
- `joined_at`: Timestamp when user joined

## API Endpoints

### Groups Collection

#### `GET /api/groups`
Get all groups for the authenticated user.

**Response:**
```json
{
  "groups": [
    {
      "id": 1,
      "name": "Trip to Paris",
      "description": "Summer vacation",
      "created_at": "2024-01-20T10:00:00.000Z",
      "updated_at": "2024-01-20T10:00:00.000Z",
      "role": "admin"
    }
  ]
}
```

#### `POST /api/groups`
Create a new group. The creator automatically becomes an admin.

**Request Body:**
```json
{
  "name": "Trip to Paris",
  "description": "Summer vacation"
}
```

**Response:**
```json
{
  "group": {
    "id": 1,
    "name": "Trip to Paris",
    "description": "Summer vacation",
    "created_by": "user123",
    "created_at": "2024-01-20T10:00:00.000Z",
    "updated_at": "2024-01-20T10:00:00.000Z"
  },
  "message": "Group created successfully"
}
```

### Individual Group

#### `GET /api/groups/[id]`
Get a specific group with its members.

**Response:**
```json
{
  "group": {
    "id": 1,
    "name": "Trip to Paris",
    "description": "Summer vacation",
    "created_by": "user123",
    "created_at": "2024-01-20T10:00:00.000Z",
    "updated_at": "2024-01-20T10:00:00.000Z",
    "members": [
      {
        "id": 1,
        "group_id": 1,
        "user_id": "user123",
        "role": "admin",
        "joined_at": "2024-01-20T10:00:00.000Z"
      }
    ]
  }
}
```

#### `PATCH /api/groups/[id]`
Update a group (admin only).

**Request Body:**
```json
{
  "name": "Trip to Paris 2024",
  "description": "Updated description"
}
```

#### `DELETE /api/groups/[id]`
Delete a group (admin only). This will also delete all associated members and expenses.

### Group Members

#### `POST /api/groups/[id]/members`
Add a new member to a group (admin only).

**Request Body:**
```json
{
  "userId": "user456",
  "role": "member"
}
```

**Response:**
```json
{
  "member": {
    "id": 2,
    "group_id": 1,
    "user_id": "user456",
    "role": "member",
    "joined_at": "2024-01-20T11:00:00.000Z"
  },
  "message": "Member added successfully"
}
```

#### `PATCH /api/groups/[id]/members/[userId]`
Update a member's role (admin only).

**Request Body:**
```json
{
  "role": "admin"
}
```

#### `DELETE /api/groups/[id]/members/[userId]`
Remove a member from a group (admin only).

## Server Actions

All server actions are in `lib/actions/groups.ts`:

### `createGroup(input: GroupInput)`
Creates a new group and adds the creator as an admin.

### `getGroups()`
Returns all groups the current user is a member of.

### `getGroupById(id: number)`
Returns a specific group with its members if the user is a member.

### `updateGroup(id: number, input: Partial<GroupInput>)`
Updates a group (admin only).

### `deleteGroup(id: number)`
Deletes a group (admin only).

### `addGroupMember(input: GroupMemberInput)`
Adds a new member to a group (admin only).

### `removeGroupMember(groupId: number, userId: string)`
Removes a member from a group (admin only).

### `updateGroupMemberRole(groupId: number, userId: string, role: 'admin' | 'member')`
Updates a member's role (admin only).

## TypeScript Types

All types are defined in `lib/types/groups.ts`:

- `Group`: Base group type from database
- `GroupWithMembers`: Group with members array
- `GroupWithUserRole`: Group with current user's role
- `CreateGroupInput`: Input for creating a group
- `UpdateGroupInput`: Input for updating a group
- `AddMemberInput`: Input for adding a member
- `UpdateMemberRoleInput`: Input for updating member role

## Authorization Rules

1. Only authenticated users can create, view, update, or delete groups
2. Only group members can view a group's details
3. Only group admins can:
   - Update group information
   - Delete the group
   - Add new members
   - Remove members
   - Update member roles
4. Group creators automatically become admins

## Database Setup

To initialize the database, run:

```bash
npx tsx lib/db/migrate.ts
```

This will create the necessary tables and indexes in `expense-sharing.db`.

## Error Handling

All API endpoints return appropriate HTTP status codes:

- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (not authenticated)
- `403`: Forbidden (not authorized)
- `404`: Not Found
- `500`: Internal Server Error

Error responses follow this format:
```json
{
  "error": "Error message"
}
```

Validation errors include details:
```json
{
  "error": "Validation error",
  "details": [
    {
      "path": ["name"],
      "message": "Name is required"
    }
  ]
}
```
