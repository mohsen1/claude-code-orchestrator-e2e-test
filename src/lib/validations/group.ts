import { z } from "zod";

/**
 * Schema for creating a new group
 */
export const createGroupSchema = z.object({
  name: z.string()
    .min(1, "Group name is required")
    .max(100, "Group name must be less than 100 characters")
    .trim(),
  description: z.string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
  currency: z.string()
    .default("USD")
    .refine((val) => /^[A-Z]{3}$/.test(val), {
      message: "Currency must be a valid ISO 4217 code (e.g., USD, EUR)",
    }),
});

export type CreateGroupInput = z.infer<typeof createGroupSchema>;

/**
 * Schema for updating a group
 */
export const updateGroupSchema = createGroupSchema.partial().extend({
  id: z.string().uuid("Invalid group ID"),
});

export type UpdateGroupInput = z.infer<typeof updateGroupSchema>;

/**
 * Schema for joining a group with invite code
 */
export const joinGroupSchema = z.object({
  inviteCode: z.string()
    .min(6, "Invalid invite code")
    .max(12, "Invalid invite code")
    .toUpperCase(),
});

export type JoinGroupInput = z.infer<typeof joinGroupSchema>;

/**
 * Schema for adding a member to a group
 */
export const addMemberSchema = z.object({
  groupId: z.string().uuid("Invalid group ID"),
  userId: z.string().uuid("Invalid user ID"),
});

export type AddMemberInput = z.infer<typeof addMemberSchema>;

/**
 * Schema for removing a member from a group
 */
export const removeMemberSchema = z.object({
  groupId: z.string().uuid("Invalid group ID"),
  userId: z.string().uuid("Invalid user ID"),
});

export type RemoveMemberInput = z.infer<typeof removeMemberSchema>;
