export interface User {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  avatar_url?: string;
  created_at: Date;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  created_by: string;
  created_at: Date;
}

export interface CreateUserInput {
  email: string;
  password: string;
  name: string;
  avatar_url?: string;
}

export interface UpdateUserInput {
  email?: string;
  name?: string;
  avatar_url?: string;
}

export interface CreateGroupInput {
  name: string;
  description?: string;
  created_by: string;
}

export interface UpdateGroupInput {
  name?: string;
  description?: string;
}

export interface GroupMember {
  group_id: string;
  user_id: string;
  joined_at: Date;
}
