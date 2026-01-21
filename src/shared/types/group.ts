export interface Group {
  id: string;
  name: string;
  description?: string | null;
  createdBy: string;
  inviteCode: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GroupMember {
  groupId: string;
  userId: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: Date;
}

export interface GroupWithMembers extends Group {
  members: Array<{
    user: {
      id: string;
      name: string;
      email: string;
      image?: string | null;
    };
    role: 'owner' | 'admin' | 'member';
    joinedAt: Date;
  }>;
}

export type CreateGroupInput = {
  name: string;
  description?: string;
};

export type UpdateGroupInput = Partial<CreateGroupInput>;

export type JoinGroupInput = {
  inviteCode: string;
};
