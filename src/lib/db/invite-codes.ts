import Database from 'better-sqlite3';
import { generateId } from '../utils';

export interface InviteCode {
  id: string;
  groupId: string;
  code: string;
  createdBy: string;
  createdAt: string;
  expiresAt: string | null;
  maxUses: number | null;
  useCount: number;
}

export class InviteCodesDB {
  constructor(private db: Database.Database) {
    this.initTable();
  }

  private initTable() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS invite_codes (
        id TEXT PRIMARY KEY,
        groupId TEXT NOT NULL,
        code TEXT NOT NULL UNIQUE,
        createdBy TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        expiresAt TEXT,
        maxUses INTEGER,
        useCount INTEGER DEFAULT 0,
        FOREIGN KEY (groupId) REFERENCES groups(id) ON DELETE CASCADE,
        FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create indexes for faster lookups
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_invite_codes_groupId
      ON invite_codes(groupId)
    `);

    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_invite_codes_code
      ON invite_codes(code)
    `);

    // Clean up expired codes periodically
    this.cleanupExpiredCodes();
  }

  create(data: Omit<InviteCode, 'id' | 'createdAt' | 'useCount'>): InviteCode {
    const invite: InviteCode = {
      id: generateId(),
      ...data,
      createdAt: new Date().toISOString(),
      useCount: 0,
    };

    const stmt = this.db.prepare(`
      INSERT INTO invite_codes (id, groupId, code, createdBy, createdAt, expiresAt, maxUses, useCount)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      invite.id,
      invite.groupId,
      invite.code,
      invite.createdBy,
      invite.createdAt,
      invite.expiresAt,
      invite.maxUses,
      invite.useCount
    );

    return invite;
  }

  generateCode(groupId: string, userId: string, options?: {
    expiresIn?: number; // hours
    maxUses?: number;
  }): InviteCode {
    const code = this.generateUniqueCode();

    let expiresAt: string | null = null;
    if (options?.expiresIn) {
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + options.expiresIn);
      expiresAt = expiryDate.toISOString();
    }

    return this.create({
      groupId,
      code,
      createdBy: userId,
      expiresAt,
      maxUses: options?.maxUses || null,
    });
  }

  findByCode(code: string): InviteCode | null {
    const stmt = this.db.prepare('SELECT * FROM invite_codes WHERE code = ?');
    const row = stmt.get(code) as any;
    return row ? this.mapRowToInviteCode(row) : null;
  }

  findByGroupId(groupId: string): InviteCode[] {
    const stmt = this.db.prepare(`
      SELECT * FROM invite_codes
      WHERE groupId = ?
      ORDER BY createdAt DESC
    `);

    const rows = stmt.all(groupId) as any[];
    return rows.map(row => this.mapRowToInviteCode(row));
  }

  isValid(code: string): boolean {
    const invite = this.findByCode(code);
    if (!invite) return false;

    // Check if expired
    if (invite.expiresAt) {
      const expiryDate = new Date(invite.expiresAt);
      if (expiryDate < new Date()) {
        return false;
      }
    }

    // Check if max uses reached
    if (invite.maxUses && invite.useCount >= invite.maxUses) {
      return false;
    }

    return true;
  }

  incrementUseCount(code: string): boolean {
    const invite = this.findByCode(code);
    if (!invite) return false;

    const stmt = this.db.prepare(`
      UPDATE invite_codes
      SET useCount = useCount + 1
      WHERE code = ?
    `);

    const result = stmt.run(code);
    return result.changes > 0;
  }

  delete(id: string): boolean {
    const stmt = this.db.prepare('DELETE FROM invite_codes WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  cleanupExpiredCodes(): void {
    const stmt = this.db.prepare(`
      DELETE FROM invite_codes
      WHERE expiresAt IS NOT NULL AND datetime(expiresAt) < datetime('now')
    `);
    stmt.run();
  }

  private generateUniqueCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code: string;
    let attempts = 0;
    const maxAttempts = 100;

    do {
      code = '';
      for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      attempts++;

      if (attempts > maxAttempts) {
        throw new Error('Failed to generate unique invite code');
      }
    } while (this.findByCode(code) !== null);

    return code;
  }

  private mapRowToInviteCode(row: any): InviteCode {
    return {
      id: row.id,
      groupId: row.groupId,
      code: row.code,
      createdBy: row.createdBy,
      createdAt: row.createdAt,
      expiresAt: row.expiresAt,
      maxUses: row.maxUses,
      useCount: row.useCount,
    };
  }
}
