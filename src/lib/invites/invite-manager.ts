import { generateInviteCode, generateInviteToken, isValidInviteCode } from './invite-generator';

export interface Invite {
  id: string;
  groupId: string;
  code: string;
  createdBy: string;
  createdAt: Date;
  expiresAt: Date | null;
  maxUses: number | null;
  useCount: number;
  acceptedBy: string[];
}

export interface InviteCreateOptions {
  groupId: string;
  createdBy: string;
  expiresAt?: Date;
  maxUses?: number;
}

/**
 * Invite Manager for handling group invitation logic
 */
export class InviteManager {
  private invites: Map<string, Invite> = new Map();
  private inviteByGroup: Map<string, string[]> = new Map();

  /**
   * Create a new invite for a group
   */
  createInvite(options: InviteCreateOptions): Invite {
    const code = generateInviteCode();
    const id = generateInviteToken();

    const invite: Invite = {
      id,
      groupId: options.groupId,
      code,
      createdBy: options.createdBy,
      createdAt: new Date(),
      expiresAt: options.expiresAt || null,
      maxUses: options.maxUses || null,
      useCount: 0,
      acceptedBy: [],
    };

    this.invites.set(code, invite);

    // Track invites by group
    if (!this.inviteByGroup.has(options.groupId)) {
      this.inviteByGroup.set(options.groupId, []);
    }
    this.inviteByGroup.get(options.groupId)!.push(code);

    return invite;
  }

  /**
   * Get an invite by code
   */
  getInvite(code: string): Invite | undefined {
    return this.invites.get(code);
  }

  /**
   * Validate an invite code
   * Checks if code exists, is not expired, and has remaining uses
   */
  validateInvite(code: string): { valid: boolean; invite?: Invite; error?: string } {
    // Check format
    if (!isValidInviteCode(code)) {
      return { valid: false, error: 'Invalid invite code format' };
    }

    const invite = this.invites.get(code);

    if (!invite) {
      return { valid: false, error: 'Invite not found' };
    }

    // Check expiration
    if (invite.expiresAt && new Date() > invite.expiresAt) {
      return { valid: false, error: 'Invite has expired' };
    }

    // Check usage limit
    if (invite.maxUses !== null && invite.useCount >= invite.maxUses) {
      return { valid: false, error: 'Invite has reached maximum uses' };
    }

    return { valid: true, invite };
  }

  /**
   * Accept an invite and add user to group
   */
  acceptInvite(code: string, userId: string): { success: boolean; invite?: Invite; error?: string } {
    const validation = this.validateInvite(code);

    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const invite = validation.invite!;

    // Check if user already accepted
    if (invite.acceptedBy.includes(userId)) {
      return { success: false, error: 'You have already accepted this invite' };
    }

    // Update invite
    invite.useCount++;
    invite.acceptedBy.push(userId);

    return { success: true, invite };
  }

  /**
   * Get all invites for a group
   */
  getGroupInvites(groupId: string): Invite[] {
    const codes = this.inviteByGroup.get(groupId) || [];
    return codes
      .map(code => this.invites.get(code))
      .filter((invite): invite is Invite => invite !== undefined);
  }

  /**
   * Delete an invite
   */
  deleteInvite(code: string): boolean {
    const invite = this.invites.get(code);
    if (!invite) return false;

    // Remove from group tracking
    const groupCodes = this.inviteByGroup.get(invite.groupId);
    if (groupCodes) {
      const index = groupCodes.indexOf(code);
      if (index > -1) {
        groupCodes.splice(index, 1);
      }
    }

    return this.invites.delete(code);
  }

  /**
   * Clean up expired invites
   */
  cleanupExpiredInvites(): number {
    let cleaned = 0;
    const now = new Date();

    for (const [code, invite] of this.invites.entries()) {
      if (invite.expiresAt && now > invite.expiresAt) {
        this.deleteInvite(code);
        cleaned++;
      }
    }

    return cleaned;
  }
}

// Singleton instance for the application
let inviteManagerInstance: InviteManager | null = null;

export function getInviteManager(): InviteManager {
  if (!inviteManagerInstance) {
    inviteManagerInstance = new InviteManager();
  }
  return inviteManagerInstance;
}
