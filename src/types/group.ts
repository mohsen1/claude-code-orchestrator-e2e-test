import { z } from 'zod';

// Group Role Enum
export const GroupRoleEnum = z.enum(['admin', 'member']);
export type GroupRole = z.infer<typeof GroupRoleEnum>;

// Database Model Schema
export const GroupSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(3, 'Group name must be at least 3 characters').max(100),
  currency: z.string().default('USD').length(3, 'Currency must be ISO 4217 code'),
  createdBy: z.string().uuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

// Group Member Schema (junction table)
export const GroupMemberSchema = z.object({
  groupId: z.string().uuid(),
  userId: z.string().uuid(),
  role: GroupRoleEnum.default('member'),
  joinedAt: z.coerce.date(),
});

// Create Group Schema
export const CreateGroupSchema = GroupSchema.pick({
  name: true,
  currency: true,
});

// Update Group Schema
export const UpdateGroupSchema = GroupSchema.pick({
  name: true,
  currency: true,
}).partial();

// Add Member to Group Schema
export const AddMemberSchema = z.object({
  groupId: z.string().uuid(),
  userId: z.string().uuid(),
  role: GroupRoleEnum.optional().default('member'),
});

// Update Member Role Schema
export const UpdateMemberRoleSchema = z.object({
  groupId: z.string().uuid(),
  userId: z.string().uuid(),
  role: GroupRoleEnum,
});

// TypeScript Types
export type Group = z.infer<typeof GroupSchema>;
export type GroupMember = z.infer<typeof GroupMemberSchema>;
export type CreateGroup = z.infer<typeof CreateGroupSchema>;
export type UpdateGroup = z.infer<typeof UpdateGroupSchema>;
export type AddMember = z.infer<typeof AddMemberSchema>;
export type UpdateMemberRole = z.infer<typeof UpdateMemberRoleSchema>;

// Group with Members Response Type
export type GroupWithMembers = Group & {
  members: (GroupMember & {
    user: {
      id: string;
      name: string;
      email: string;
      image: string | null;
    };
  })[];
};
