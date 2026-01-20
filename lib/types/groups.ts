import { Group, GroupMember } from '@/lib/db/schema';

export type GroupWithMembers = Group & {
  members: GroupMember[];
};

export type GroupWithUserRole = Group & {
  role: 'admin' | 'member';
};

export interface CreateGroupInput {
  name: string;
  description?: string;
}

export interface UpdateGroupInput {
  name?: string;
  description?: string;
}

export interface AddMemberInput {
  userId: string;
  role?: 'admin' | 'member';
}

export interface UpdateMemberRoleInput {
  role: 'admin' | 'member';
}

export interface GroupApiResponse {
  success: boolean;
  data?: GroupWithMembers | GroupWithUserRole;
  error?: string;
  message?: string;
}

export interface GroupsListApiResponse {
  success: boolean;
  data?: GroupWithUserRole[];
  error?: string;
  message?: string;
}
