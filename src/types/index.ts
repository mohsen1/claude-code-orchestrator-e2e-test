// Database Types
export interface Group {
  id: string;
  name: string;
  description?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface GroupMember {
  id: number;
  group_id: string;
  user_email: string;
  role: 'admin' | 'member';
  joined_at: string;
  balance: number;
}

export interface GroupInvite {
  id: number;
  group_id: string;
  email: string;
  invite_code: string;
  invited_by: string;
  created_at: string;
  expires_at?: string;
}

export interface Expense {
  id: string;
  group_id: string;
  description: string;
  amount: number;
  paid_by: string;
  created_at: string;
  updated_at: string;
}

export interface ExpenseSplit {
  id: number;
  expense_id: string;
  member_id: number;
  amount: number;
}

export interface Settlement {
  id: string;
  group_id: string;
  from_email: string;
  to_email: string;
  amount: number;
  settled_at: string;
}

// API Response Types
export interface InviteResponse {
  success: boolean;
  message: string;
  inviteCode: string;
  inviteUrl?: string;
}

export interface InviteValidationResponse {
  valid: boolean;
  groupId?: string;
  groupName?: string;
  inviterEmail?: string;
  inviteeEmail?: string;
  alreadyMember?: boolean;
  expired?: boolean;
  message?: string;
}

export interface AcceptInviteResponse {
  success: boolean;
  groupId: string;
  groupName: string;
  userId: number;
  role: string;
  message: string;
}

export interface MemberResponse {
  member: {
    id: number;
    email: string;
    role: string;
    joinedAt: string;
    balance: number;
    expenseSummary: {
      totalExpenses: number;
      totalSpent: number;
    };
  };
}

// Socket Event Types
export interface SocketMemberJoinedEvent {
  groupId: string;
  userEmail: string;
  timestamp: string;
}

export interface SocketMemberRemovedEvent {
  groupId: string;
  removedMemberEmail: string;
  removedBy: string;
  timestamp: string;
}

export interface SocketMemberUpdatedEvent {
  groupId: string;
  memberEmail: string;
  newRole: string;
  updatedBy: string;
  timestamp: string;
}
