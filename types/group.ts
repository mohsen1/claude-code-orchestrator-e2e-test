import { z } from 'zod'

/**
 * Group domain types for SplitSync application
 * Defines the structure and validation schemas for group entities
 */

/**
 * Role a member can have within a group
 */
export enum GroupMemberRole {
  /** Owner has full control and cannot be removed */
  OWNER = 'owner',
  /** Admin can manage members and expenses but cannot delete group */
  ADMIN = 'admin',
  /** Regular member can add expenses and view group data */
  MEMBER = 'member',
}

/**
 * Status of a group invite
 */
export enum GroupInviteStatus {
  /** Invite has been created but not yet accepted */
  PENDING = 'pending',
  /** Invite has been accepted and user joined the group */
  ACCEPTED = 'accepted',
  /** Invite has been declined */
  DECLINED = 'declined',
  /** Invite has expired */
  EXPIRED = 'expired',
  /** Invite has been revoked */
  REVOKED = 'revoked',
}

/**
 * Group entity representing an expense sharing group
 */
export interface Group {
  /** Unique identifier (UUID v4) */
  id: string
  /** Group name */
  name: string
  /** Group description (optional) */
  description?: string | null
  /** Default currency for the group */
  currencyCode: string
  /** Group avatar URL (optional) */
  avatar?: string | null
  /** ID of the user who created the group */
  createdById: string
  /** Whether the group is archived (read-only) */
  isArchived: boolean
  /** Date when group was archived */
  archivedAt?: Date | null
  /** Whether new members can join via invite link */
  inviteEnabled: boolean
  /** Maximum number of members allowed (null = unlimited) */
  maxMembers?: number | null
  /** Group creation timestamp */
  createdAt: Date
  /** Last update timestamp */
  updatedAt: Date
}

/**
 * Group member entity
 */
export interface GroupMember {
  /** Unique identifier for the membership */
  id: string
  /** ID of the group */
  groupId: string
  /** ID of the user who is a member */
  userId: string
  /** Role of the member within the group */
  role: GroupMemberRole
  /** When the user joined the group */
  joinedAt: Date
  /** Whether the member has left the group */
  hasLeft: boolean
  /** When the member left the group (if applicable) */
  leftAt?: Date | null
  /** Balance in the group (in cents, positive = owed money, negative = owes money) */
  balance: number
}

/**
 * Group invite entity
 */
export interface GroupInvite {
  /** Unique identifier (UUID v4) */
  id: string
  /** ID of the group being invited to */
  groupId: string
  /** Email of the invited user */
  email: string
  /** ID of the user who created the invite */
  createdById: string
  /** Invite token (secure random string) */
  token: string
  /** Current status of the invite */
  status: GroupInviteStatus
  /** Role the invited user will have upon joining */
  role: GroupMemberRole
  /** Invite expiration date */
  expiresAt: Date
  /** When the invite was created */
  createdAt: Date
  /** When the invite status was last updated */
  updatedAt: Date
  /** When the invite was accepted (if applicable) */
  acceptedAt?: Date | null
  /** ID of the user who accepted the invite (if applicable) */
  acceptedById?: string | null
}

/**
 * Input schema for creating a new group
 */
export interface GroupCreateInput {
  name: string
  description?: string
  currencyCode?: string
  avatar?: string
  inviteEnabled?: boolean
  maxMembers?: number
}

/**
 * Input schema for updating a group
 */
export interface GroupUpdateInput {
  name?: string
  description?: string
  avatar?: string
  currencyCode?: string
  isArchived?: boolean
  inviteEnabled?: boolean
  maxMembers?: number
}

/**
 * Input schema for creating a group invite
 */
export interface GroupInviteCreateInput {
  groupId: string
  email: string
  role: GroupMemberRole
  expiresInHours: number
}

/**
 * Statistics for a group
 */
export interface GroupStats {
  groupId: string
  totalMembers: number
  activeMembers: number
  totalExpenses: number
  totalExpenseAmount: number // in cents
  totalSettlements: number
  totalSettledAmount: number // in cents
  pendingSettlements: number
  pendingSettlementAmount: number // in cents
  averageExpenseAmount: number // in cents
  largestExpense: {
    id: string
    description: string
    amount: number // in cents
    date: Date
  } | null
  mostActiveMember: {
    userId: string
    userName: string
    expenseCount: number
  } | null
  createdDate: Date
  lastActivity: Date
}

// Zod validation schemas for runtime validation

/**
 * Schema for validating group creation input
 */
export const groupCreateSchema = z.object({
  name: z.string().min(2, 'Group name must be at least 2 characters').max(100),
  description: z.string().max(500).optional(),
  currencyCode: z.string().length(3).default('USD'),
  avatar: z.string().url().optional(),
  inviteEnabled: z.boolean().default(true),
  maxMembers: z.number().int().positive().optional(),
})

/**
 * Schema for validating group update input
 */
export const groupUpdateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional(),
  avatar: z.string().url().optional().nullable(),
  currencyCode: z.string().length(3).optional(),
  isArchived: z.boolean().optional(),
  inviteEnabled: z.boolean().optional(),
  maxMembers: z.number().int().positive().optional(),
})

/**
 * Schema for validating group invite creation input
 */
export const groupInviteCreateSchema = z.object({
  groupId: z.string().uuid('Invalid group ID'),
  email: z.string().email('Invalid email address'),
  role: z.nativeEnum(GroupMemberRole).default(GroupMemberRole.MEMBER),
  expiresInHours: z.number().int().min(1).max(720).default(168), // 1 hour to 30 days, default 7 days
})

/**
 * Schema for validating group member role update
 */
export const groupMemberRoleUpdateSchema = z.object({
  role: z.nativeEnum(GroupMemberRole),
})

/**
 * Schema for validating group name
 */
export const groupNameSchema = z
  .string()
  .min(2, 'Group name must be at least 2 characters')
  .max(100, 'Group name must not exceed 100 characters')

// Type inference from schemas
export type GroupCreateInputSchema = z.infer<typeof groupCreateSchema>
export type GroupUpdateInputSchema = z.infer<typeof groupUpdateSchema>
export type GroupInviteCreateInputSchema = z.infer<typeof groupInviteCreateSchema>
export type GroupMemberRoleUpdateInputSchema = z.infer<typeof groupMemberRoleUpdateSchema>

// Helper functions for group-related operations

/**
 * Checks if a member can perform admin actions
 */
export function canPerformAdminActions(member: GroupMember): boolean {
  return member.role === GroupMemberRole.OWNER || member.role === GroupMemberRole.ADMIN
}

/**
 * Checks if a member is the owner
 */
export function isGroupOwner(member: GroupMember): boolean {
  return member.role === GroupMemberRole.OWNER
}

/**
 * Checks if a member is an admin
 */
export function isGroupAdmin(member: GroupMember): boolean {
  return member.role === GroupMemberRole.ADMIN
}

/**
 * Checks if a member is still active (has not left)
 */
export function isMemberActive(member: GroupMember): boolean {
  return !member.hasLeft
}

/**
 * Checks if a group is archived
 */
export function isGroupArchived(group: Group): boolean {
  return group.isArchived
}

/**
 * Checks if invites are enabled for a group
 */
export function areInvitesEnabled(group: Group): boolean {
  return group.inviteEnabled && !group.isArchived
}

/**
 * Checks if a group has reached its member limit
 */
export function isGroupFull(group: Group, currentMemberCount: number): boolean {
  return group.maxMembers !== null && currentMemberCount >= (group.maxMembers ?? Infinity)
}

/**
 * Checks if an invite is valid and not expired
 */
export function isInviteValid(invite: GroupInvite): boolean {
  return invite.status === GroupInviteStatus.PENDING && invite.expiresAt > new Date()
}

/**
 * Generates an invite link from an invite token
 */
export function generateInviteLink(token: string, baseUrl: string = ''): string {
  return `${baseUrl}/invite/${token}`
}

/**
 * Calculates days until invite expiration
 */
export function getInviteDaysUntilExpiration(invite: GroupInvite): number {
  const now = new Date()
  const expiresAt = new Date(invite.expiresAt)
  const diffMs = expiresAt.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
  return Math.max(0, diffDays)
}

/**
 * Formats a group's balance for display
 */
export function formatGroupBalance(balance: number, currencyCode: string): string {
  const isPositive = balance >= 0
  const absBalance = Math.abs(balance)
  const amount = absBalance / 100
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
  })
  const formatted = formatter.format(amount)
  return isPositive ? formatted : `-${formatted}`
}

/**
 * Gets group initials for avatar generation
 */
export function getGroupInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/**
 * Sorts group members by role (owner first, then admins, then members)
 */
export function sortGroupMembersByRole(members: GroupMember[]): GroupMember[] {
  const roleOrder = {
    [GroupMemberRole.OWNER]: 0,
    [GroupMemberRole.ADMIN]: 1,
    [GroupMemberRole.MEMBER]: 2,
  }

  return [...members].sort((a, b) => {
    if (a.role !== b.role) {
      return roleOrder[a.role] - roleOrder[b.role]
    }
    return a.joinedAt.getTime() - b.joinedAt.getTime()
  })
}

/**
 * Filters active members from a list of group members
 */
export function getActiveMembers(members: GroupMember[]): GroupMember[] {
  return members.filter(isMemberActive)
}

/**
 * Gets group members sorted by balance (highest positive first)
 */
export function sortMembersByBalance(members: GroupMember[]): GroupMember[] {
  return [...members].sort((a, b) => b.balance - a.balance)
}
