export interface Group {
  id: string;
  name: string;
  description?: string;
  created_by: string;
  created_at: number;
  updated_at: number;
  memberCount?: number;
  pendingInvitations?: number;
  currentUserRole?: 'admin' | 'member';
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: 'admin' | 'member';
  status: 'active' | 'pending' | 'removed';
  joined_at: number;
  updated_at: number;
}

export interface GroupInvitation {
  id: string;
  group_id: string;
  email: string;
  invited_by: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  created_at: number;
  expires_at: number;
  updated_at: number;
}

export interface CreateGroupInput {
  name: string;
  description?: string;
}

export interface UpdateGroupInput {
  name?: string;
  description?: string;
}

export interface InviteMemberInput {
  email: string;
  expiresInHours?: number;
}

export interface UpdateMemberRoleInput {
  memberId: string;
  role: 'admin' | 'member';
}
