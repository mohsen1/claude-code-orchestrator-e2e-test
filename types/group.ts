export interface Group {
  id: number;
  name: string;
  description: string | null;
  created_by: number;
  created_at: string;
}

export interface GroupDTO {
  id: number;
  name: string;
  description: string | null;
  created_by: number;
  created_at: string;
  member_count?: number;
  members?: GroupMemberDTO[];
}

export interface CreateGroupInput {
  name: string;
  description?: string;
}

export interface InviteMemberInput {
  group_id: number;
  email: string;
}

export interface GroupMemberDTO {
  id: number;
  user_id: number;
  name: string;
  email: string;
  joined_at: string;
}
