/**
 * Group Management System - Usage Examples
 *
 * This file demonstrates how to use the group management system
 * in your Next.js application.
 */

// ============================================
// SERVER ACTIONS USAGE (in Server Components)
// ============================================

import {
  createGroup,
  getGroups,
  getGroupById,
  updateGroup,
  deleteGroup,
  addGroupMember,
  removeGroupMember,
  updateGroupMemberRole,
} from '@/lib/actions/groups';

// Example 1: Creating a new group
async function createNewGroup() {
  try {
    const group = await createGroup({
      name: 'Summer Vacation 2024',
      description: 'Expenses for our trip to Spain',
    });
    console.log('Created group:', group);
    return group;
  } catch (error) {
    console.error('Failed to create group:', error);
  }
}

// Example 2: Getting all user groups
async function listUserGroups() {
  try {
    const groups = await getGroups();
    console.log('User groups:', groups);
    return groups;
  } catch (error) {
    console.error('Failed to fetch groups:', error);
  }
}

// Example 3: Getting a specific group with members
async function viewGroupDetails(groupId: number) {
  try {
    const group = await getGroupById(groupId);
    if (group) {
      console.log('Group details:', group);
      console.log('Members:', group.members);
    }
    return group;
  } catch (error) {
    console.error('Failed to fetch group:', error);
  }
}

// Example 4: Updating a group
async function modifyGroup(groupId: number) {
  try {
    const updatedGroup = await updateGroup(groupId, {
      name: 'Updated Group Name',
      description: 'New description',
    });
    console.log('Updated group:', updatedGroup);
    return updatedGroup;
  } catch (error) {
    console.error('Failed to update group:', error);
  }
}

// Example 5: Adding a member to a group
async function inviteMember(groupId: number, userId: string) {
  try {
    const member = await addGroupMember({
      groupId,
      userId,
      role: 'member',
    });
    console.log('Added member:', member);
    return member;
  } catch (error) {
    console.error('Failed to add member:', error);
  }
}

// Example 6: Updating member role to admin
async function promoteToAdmin(groupId: number, userId: string) {
  try {
    const updatedMember = await updateGroupMemberRole(
      groupId,
      userId,
      'admin'
    );
    console.log('Promoted to admin:', updatedMember);
    return updatedMember;
  } catch (error) {
    console.error('Failed to update role:', error);
  }
}

// Example 7: Removing a member
async function kickMember(groupId: number, userId: string) {
  try {
    await removeGroupMember(groupId, userId);
    console.log('Member removed successfully');
  } catch (error) {
    console.error('Failed to remove member:', error);
  }
}

// Example 8: Deleting a group
async function disbandGroup(groupId: number) {
  try {
    await deleteGroup(groupId);
    console.log('Group deleted successfully');
  } catch (error) {
    console.error('Failed to delete group:', error);
  }
}

// ============================================
// API ROUTES USAGE (from Client Components)
// ============================================

// Example 9: Fetching groups from API (Client Component)
async function fetchGroupsFromAPI() {
  const response = await fetch('/api/groups');
  if (!response.ok) {
    throw new Error('Failed to fetch groups');
  }
  const data = await response.json();
  return data.groups;
}

// Example 10: Creating a group via API (Client Component)
async function createGroupViaAPI(groupData: { name: string; description?: string }) {
  const response = await fetch('/api/groups', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(groupData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create group');
  }

  const data = await response.json();
  return data.group;
}

// Example 11: Updating a group via API (Client Component)
async function updateGroupViaAPI(
  groupId: number,
  updates: { name?: string; description?: string }
) {
  const response = await fetch(`/api/groups/${groupId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update group');
  }

  const data = await response.json();
  return data.group;
}

// Example 12: Adding a member via API (Client Component)
async function addMemberViaAPI(groupId: number, userId: string) {
  const response = await fetch(`/api/groups/${groupId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId, role: 'member' }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to add member');
  }

  const data = await response.json();
  return data.member;
}

// Example 13: Removing a member via API (Client Component)
async function removeMemberViaAPI(groupId: number, userId: string) {
  const response = await fetch(`/api/groups/${groupId}/members/${userId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to remove member');
  }

  return await response.json();
}

// ============================================
// REACT COMPONENT EXAMPLE
// ============================================

'use client';

import { useState, useEffect } from 'react';

interface Group {
  id: number;
  name: string;
  description?: string;
  role: 'admin' | 'member';
}

export function GroupsList() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadGroups();
  }, []);

  async function loadGroups() {
    try {
      setLoading(true);
      const response = await fetch('/api/groups');
      if (!response.ok) {
        throw new Error('Failed to fetch groups');
      }
      const data = await response.json();
      setGroups(data.groups);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateGroup() {
    const name = prompt('Enter group name:');
    if (!name) return;

    try {
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        throw new Error('Failed to create group');
      }

      await loadGroups(); // Refresh the list
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create group');
    }
  }

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <button onClick={handleCreateGroup}>Create New Group</button>
      <ul>
        {groups.map((group) => (
          <li key={group.id}>
            <strong>{group.name}</strong> ({group.role})
            {group.description && <p>{group.description}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ============================================
// SERVER COMPONENT EXAMPLE
// ============================================

import { getGroups } from '@/lib/actions/groups';
import { auth } from '@/auth';

export async function GroupsServerComponent() {
  const session = await auth();

  if (!session?.user) {
    return <div>Please sign in to view groups</div>;
  }

  const groups = await getGroups();

  return (
    <div>
      <h1>Your Groups</h1>
      {groups.length === 0 ? (
        <p>No groups yet. Create one to get started!</p>
      ) : (
        <ul>
          {groups.map((group) => (
            <li key={group.id}>
              <h2>{group.name}</h2>
              {group.description && <p>{group.description}</p>}
              <p>Role: {group.role}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export {
  createNewGroup,
  listUserGroups,
  viewGroupDetails,
  modifyGroup,
  inviteMember,
  promoteToAdmin,
  kickMember,
  disbandGroup,
  fetchGroupsFromAPI,
  createGroupViaAPI,
  updateGroupViaAPI,
  addMemberViaAPI,
  removeMemberViaAPI,
};
