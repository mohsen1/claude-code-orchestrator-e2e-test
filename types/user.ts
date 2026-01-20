export interface User {
  id: number;
  email: string;
  name: string;
  password_hash: string;
  created_at: string;
}

export interface UserDTO {
  id: number;
  email: string;
  name: string;
  created_at: string;
}

export interface CreateGroupMemberInput {
  group_id: number;
  user_id: number;
}

export interface GroupMember {
  id: number;
  group_id: number;
  user_id: number;
  joined_at: string;
  user?: UserDTO;
}
