/**
 * Group domain type
 * Represents a group of users sharing expenses
 */
export interface Group {
  id: string;
  name: string;
  invite_code: string;
  created_by: string;
  created_at?: Date;
  updated_at?: Date;
}

/**
 * Group creation input
 */
export interface CreateGroupInput {
  name: string;
  created_by: string;
}

/**
 * Group update input
 */
export interface UpdateGroupInput {
  name?: string;
}

/**
 * Group with member information
 */
export interface GroupWithMembers extends Group {
  members: Array<{
    id: string;
    name: string;
    email: string;
  }>;
  member_count: number;
}
