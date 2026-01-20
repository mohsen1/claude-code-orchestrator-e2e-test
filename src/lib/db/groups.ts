import Database from 'better-sqlite3';
import { generateId } from '../utils';

export interface Group {
  id: string;
  name: string;
  description: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  currency: string;
}

export interface GroupWithMemberCount extends Group {
  memberCount: number;
  isAdmin: boolean;
}

export class GroupsDB {
  constructor(private db: Database.Database) {
    this.initTable();
  }

  private initTable() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS groups (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        createdBy TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        currency TEXT DEFAULT 'USD'
      )
    `);

    // Create index for faster lookups
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_groups_createdBy
      ON groups(createdBy)
    `);
  }

  create(data: Omit<Group, 'id' | 'createdAt' | 'updatedAt'>): Group {
    const now = new Date().toISOString();
    const group: Group = {
      id: generateId(),
      ...data,
      createdAt: now,
      updatedAt: now,
    };

    const stmt = this.db.prepare(`
      INSERT INTO groups (id, name, description, createdBy, createdAt, updatedAt, currency)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      group.id,
      group.name,
      group.description,
      group.createdBy,
      group.createdAt,
      group.updatedAt,
      group.currency
    );

    return group;
  }

  findById(id: string): Group | null {
    const stmt = this.db.prepare('SELECT * FROM groups WHERE id = ?');
    const row = stmt.get(id) as any;
    return row ? this.mapRowToGroup(row) : null;
  }

  findByUserId(userId: string): GroupWithMemberCount[] {
    const stmt = this.db.prepare(`
      SELECT
        g.*,
        COUNT(DISTINCT gm.userId) as memberCount,
        MAX(CASE WHEN gm.role = 'admin' AND gm.userId = ? THEN 1 ELSE 0 END) as isAdmin
      FROM groups g
      INNER JOIN group_members gm ON g.id = gm.groupId
      WHERE gm.userId = ?
      GROUP BY g.id
      ORDER BY g.updatedAt DESC
    `);

    const rows = stmt.all(userId, userId) as any[];
    return rows.map(row => ({
      ...this.mapRowToGroup(row),
      memberCount: row.memberCount,
      isAdmin: Boolean(row.isAdmin),
    }));
  }

  update(id: string, data: Partial<Omit<Group, 'id' | 'createdAt' | 'createdBy'>>): Group | null {
    const existing = this.findById(id);
    if (!existing) return null;

    const updated: Group = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
    };

    const stmt = this.db.prepare(`
      UPDATE groups
      SET name = ?, description = ?, currency = ?, updatedAt = ?
      WHERE id = ?
    `);

    stmt.run(
      updated.name,
      updated.description,
      updated.currency,
      updated.updatedAt,
      id
    );

    return updated;
  }

  delete(id: string): boolean {
    const stmt = this.db.prepare('DELETE FROM groups WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  private mapRowToGroup(row: any): Group {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      createdBy: row.createdBy,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      currency: row.currency || 'USD',
    };
  }
}
