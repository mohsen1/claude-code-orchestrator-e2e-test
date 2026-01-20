'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface Group {
  id: string;
  name: string;
  description: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  currency: string;
  memberCount?: number;
  isAdmin?: boolean;
}

export interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  role: 'admin' | 'member';
  joinedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
}

export interface GroupDetail extends Group {
  members: GroupMember[];
  currentUserRole: 'admin' | 'member';
}

interface UseGroupsOptions {
  autoFetch?: boolean;
}

export function useGroups(options?: UseGroupsOptions) {
  const { toast } = useToast();
  const [groups, setGroups] = useState<Group[]>([]);
  const [currentGroup, setCurrentGroup] = useState<GroupDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all groups
  const fetchGroups = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/groups');

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch groups');
      }

      const data = await response.json();
      setGroups(data.groups || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch groups';
      setError(message);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Fetch single group by ID
  const fetchGroup = useCallback(async (groupId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/groups/${groupId}`);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch group');
      }

      const data = await response.json();
      setCurrentGroup(data.group);
      return data.group;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch group';
      setError(message);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Create a new group
  const createGroup = useCallback(async (data: {
    name: string;
    description?: string;
    currency?: string;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to create group');
      }

      const result = await response.json();

      // Refresh groups list
      await fetchGroups();

      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create group';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchGroups]);

  // Update a group
  const updateGroup = useCallback(async (
    groupId: string,
    data: Partial<Pick<Group, 'name' | 'description' | 'currency'>>
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/groups/${groupId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to update group');
      }

      const result = await response.json();

      // Update local state
      if (currentGroup?.id === groupId) {
        setCurrentGroup({
          ...currentGroup,
          ...result.group,
        });
      }

      // Refresh groups list
      await fetchGroups();

      return result.group;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update group';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [currentGroup, fetchGroups]);

  // Delete a group
  const deleteGroup = useCallback(async (groupId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/groups/${groupId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to delete group');
      }

      // Remove from local state
      setGroups(prev => prev.filter(g => g.id !== groupId));
      if (currentGroup?.id === groupId) {
        setCurrentGroup(null);
      }

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete group';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [currentGroup]);

  // Generate invite code
  const generateInviteCode = useCallback(async (groupId: string, options?: {
    expiresIn?: number; // hours
    maxUses?: number;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/groups/${groupId}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options || {}),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to generate invite code');
      }

      const result = await response.json();
      return result.invite;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate invite code';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Join a group with invite code
  const joinGroup = useCallback(async (groupId: string, code: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/groups/${groupId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to join group');
      }

      const result = await response.json();

      // Refresh groups list
      await fetchGroups();

      return result.member;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to join group';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchGroups]);

  // Update member role
  const updateMemberRole = useCallback(async (
    groupId: string,
    memberId: string,
    role: 'admin' | 'member'
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/groups/${groupId}/members/${memberId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role }),
        }
      );

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to update member role');
      }

      const result = await response.json();

      // Update local state if we have the group loaded
      if (currentGroup?.id === groupId) {
        setCurrentGroup({
          ...currentGroup,
          members: currentGroup.members.map(m =>
            m.userId === memberId ? { ...m, role: result.member.role } : m
          ),
        });
      }

      return result.member;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update member role';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [currentGroup]);

  // Remove member from group
  const removeMember = useCallback(async (groupId: string, memberId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/groups/${groupId}/members/${memberId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to remove member');
      }

      // Update local state if we have the group loaded
      if (currentGroup?.id === groupId) {
        setCurrentGroup({
          ...currentGroup,
          members: currentGroup.members.filter(m => m.userId !== memberId),
        });
      }

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to remove member';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [currentGroup]);

  // Fetch members of a group
  const fetchMembers = useCallback(async (groupId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/groups/${groupId}/members`);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch members');
      }

      const data = await response.json();
      return data.members || [];
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch members';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auto-fetch groups on mount if enabled
  useEffect(() => {
    if (options?.autoFetch !== false) {
      fetchGroups();
    }
  }, [options?.autoFetch, fetchGroups]);

  return {
    groups,
    currentGroup,
    isLoading,
    error,
    fetchGroups,
    fetchGroup,
    createGroup,
    updateGroup,
    deleteGroup,
    generateInviteCode,
    joinGroup,
    updateMemberRole,
    removeMember,
    fetchMembers,
    setCurrentGroup,
  };
}
