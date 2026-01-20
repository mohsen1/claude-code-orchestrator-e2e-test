export interface Group {
  id: string;
  name: string;
  description?: string;
  currency: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreateGroupInput {
  name: string;
  description?: string;
  currency?: string;
  created_by: string;
}

export interface UpdateGroupInput {
  name?: string;
  description?: string;
  currency?: string;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: 'admin' | 'member';
  joined_at: string;
}

export interface GroupWithMembers extends Group {
  members: Array<{
    id: string;
    user_id: string;
    role: string;
    joined_at: string;
  }>;
  member_count: number;
}
