import { z } from 'zod';

/**
 * Group role enum for validation
 */
export const GroupRoleSchema = z.enum(['ADMIN', 'MEMBER']);

/**
 * Schema for creating a group
 */
export const CreateGroupSchema = z.object({
  name: z
    .string()
    .min(1, 'Group name is required')
    .max(100, 'Group name must be less than 100 characters')
    .trim(),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .trim()
    .nullable()
    .optional(),
});

/**
 * Schema for updating a group
 */
export const UpdateGroupSchema = z.object({
  name: z
    .string()
    .min(1, 'Group name is required')
    .max(100, 'Group name must be less than 100 characters')
    .trim()
    .optional(),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .trim()
    .nullable()
    .optional(),
});

/**
 * Schema for archiving a group
 */
export const ArchiveGroupSchema = z.object({
  groupId: z.string().uuid('Invalid group ID format'),
  reason: z.string().max(500).optional(),
});

/**
 * Schema for deleting a group
 */
export const DeleteGroupSchema = z.object({
  groupId: z.string().uuid('Invalid group ID format'),
  confirmName: z.string().refine(
    (val) => val.length > 0,
    'Please type the group name to confirm deletion'
  ),
});

/**
 * Schema for inviting members
 */
export const InviteMemberSchema = z.object({
  groupId: z.string().uuid('Invalid group ID format'),
  expiresIn: z.coerce
    .number()
    .int()
    .positive('Expiration must be a positive number of hours')
    .max(8760, 'Expiration cannot exceed 1 year (8760 hours)')
    .default(168), // Default 7 days
  maxUses: z.coerce
    .number()
    .int()
    .positive('Max uses must be a positive number')
    .max(100, 'Max uses cannot exceed 100')
    .default(1),
});

/**
 * Schema for joining a group via invite code
 */
export const JoinGroupSchema = z.object({
  inviteCode: z
    .string()
    .min(6, 'Invite code must be at least 6 characters')
    .max(20, 'Invite code must be less than 20 characters')
    .trim(),
});

/**
 * Schema for updating member role
 */
export const UpdateMemberRoleSchema = z.object({
  groupId: z.string().uuid('Invalid group ID format'),
  userId: z.string().uuid('Invalid user ID format'),
  role: GroupRoleSchema,
});

/**
 * Schema for removing a member
 */
export const RemoveMemberSchema = z.object({
  groupId: z.string().uuid('Invalid group ID format'),
  userId: z.string().uuid('Invalid user ID format'),
  reason: z.string().max(500).optional(),
});

/**
 * Schema for leaving a group
 */
export const LeaveGroupSchema = z.object({
  groupId: z.string().uuid('Invalid group ID format'),
});

/**
 * Infer types from schemas
 */
export type CreateGroupInput = z.infer<typeof CreateGroupSchema>;
export type UpdateGroupInput = z.infer<typeof UpdateGroupSchema>;
export type ArchiveGroupInput = z.infer<typeof ArchiveGroupSchema>;
export type DeleteGroupInput = z.infer<typeof DeleteGroupSchema>;
export type InviteMemberInput = z.infer<typeof InviteMemberSchema>;
export type JoinGroupInput = z.infer<typeof JoinGroupSchema>;
export type UpdateMemberRoleInput = z.infer<typeof UpdateMemberRoleSchema>;
export type RemoveMemberInput = z.infer<typeof RemoveMemberSchema>;
export type LeaveGroupInput = z.infer<typeof LeaveGroupSchema>;
