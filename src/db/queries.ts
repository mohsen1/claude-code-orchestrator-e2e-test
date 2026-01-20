import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';

export class QueryBuilder {
  constructor(private db: Database.Database) {}

  user() {
    return {
      create: (data: { id?: string; email: string; name: string; avatar_url?: string }) => {
        const id = data.id || uuidv4();
        const stmt = this.db.prepare(
          'INSERT INTO users (id, email, name, avatar_url) VALUES (?, ?, ?, ?)'
        );
        stmt.run(id, data.email, data.name, data.avatar_url || null);
        return id;
      },

      findById: (id: string) => {
        return this.db.prepare('SELECT * FROM users WHERE id = ?').get(id);
      },

      findByEmail: (email: string) => {
        return this.db.prepare('SELECT * FROM users WHERE email = ?').get(email);
      },

      update: (id: string, data: Partial<{ name: string; avatar_url: string }>) => {
        const fields: string[] = [];
        const values: any[] = [];

        if (data.name) {
          fields.push('name = ?');
          values.push(data.name);
        }
        if (data.avatar_url !== undefined) {
          fields.push('avatar_url = ?');
          values.push(data.avatar_url);
        }

        if (fields.length === 0) return;

        values.push(Math.floor(Date.now() / 1000));
        fields.push('updated_at = ?');
        values.push(id);

        const stmt = this.db.prepare(
          `UPDATE users SET ${fields.join(', ')} WHERE id = ?`
        );
        stmt.run(...values);
      },
    };
  }

  group() {
    return {
      create: (data: {
        id?: string;
        name: string;
        description?: string;
        currency?: string;
        created_by: string;
      }) => {
        const id = data.id || uuidv4();
        const stmt = this.db.prepare(
          'INSERT INTO groups (id, name, description, currency, created_by) VALUES (?, ?, ?, ?, ?)'
        );
        stmt.run(
          id,
          data.name,
          data.description || null,
          data.currency || 'USD',
          data.created_by
        );
        return id;
      },

      findById: (id: string) => {
        return this.db.prepare('SELECT * FROM groups WHERE id = ?').get(id);
      },

      findByMember: (userId: string) => {
        return this.db
          .prepare(
            `
            SELECT g.*, COUNT(DISTINCT gm.user_id) as member_count
            FROM groups g
            JOIN group_members gm ON g.id = gm.group_id
            WHERE gm.user_id = ?
            GROUP BY g.id
          `
          )
          .all(userId);
      },

      addMember: (groupId: string, userId: string) => {
        const id = uuidv4();
        const stmt = this.db.prepare(
          'INSERT INTO group_members (id, group_id, user_id) VALUES (?, ?, ?)'
        );
        stmt.run(id, groupId, userId);
        return id;
      },

      removeMember: (groupId: string, userId: string) => {
        const stmt = this.db.prepare(
          'DELETE FROM group_members WHERE group_id = ? AND user_id = ?'
        );
        stmt.run(groupId, userId);
      },

      getMembers: (groupId: string) => {
        return this.db
          .prepare(
            `
            SELECT u.*, gm.joined_at
            FROM users u
            JOIN group_members gm ON u.id = gm.user_id
            WHERE gm.group_id = ?
            ORDER BY gm.joined_at ASC
          `
          )
          .all(groupId);
      },
    };
  }

  expense() {
    return {
      create: (data: {
        id?: string;
        group_id: string;
        description: string;
        amount: number;
        currency?: string;
        paid_by: string;
        category?: string;
        expense_date?: number;
      }) => {
        const id = data.id || uuidv4();
        const stmt = this.db.prepare(
          `INSERT INTO expenses (
            id, group_id, description, amount, currency, paid_by, category, expense_date
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        );
        stmt.run(
          id,
          data.group_id,
          data.description,
          data.amount,
          data.currency || 'USD',
          data.paid_by,
          data.category || null,
          data.expense_date || Math.floor(Date.now() / 1000)
        );
        return id;
      },

      findById: (id: string) => {
        return this.db
          .prepare(
            `
            SELECT e.*, u.name as paid_by_name, u.avatar_url as paid_by_avatar
            FROM expenses e
            JOIN users u ON e.paid_by = u.id
            WHERE e.id = ?
          `
          )
          .get(id);
      },

      findByGroup: (groupId: string, limit = 50) => {
        return this.db
          .prepare(
            `
            SELECT e.*, u.name as paid_by_name, u.avatar_url as paid_by_avatar
            FROM expenses e
            JOIN users u ON e.paid_by = u.id
            WHERE e.group_id = ?
            ORDER BY e.expense_date DESC
            LIMIT ?
          `
          )
          .all(groupId, limit);
      },

      addSplit: (expenseId: string, userId: string, amount: number, percentage: number) => {
        const id = uuidv4();
        const stmt = this.db.prepare(
          'INSERT INTO expense_splits (id, expense_id, user_id, amount, percentage) VALUES (?, ?, ?, ?, ?)'
        );
        stmt.run(id, expenseId, userId, amount, percentage);
        return id;
      },

      getSplits: (expenseId: string) => {
        return this.db
          .prepare(
            `
            SELECT es.*, u.name as user_name, u.avatar_url as user_avatar
            FROM expense_splits es
            JOIN users u ON es.user_id = u.id
            WHERE es.expense_id = ?
          `
          )
          .all(expenseId);
      },
    };
  }

  settlement() {
    return {
      create: (data: {
        id?: string;
        group_id: string;
        from_user_id: string;
        to_user_id: string;
        amount: number;
        currency?: string;
      }) => {
        const id = data.id || uuidv4();
        const stmt = this.db.prepare(
          `INSERT INTO settlements (
            id, group_id, from_user_id, to_user_id, amount, currency, status
          ) VALUES (?, ?, ?, ?, ?, ?, 'pending')`
        );
        stmt.run(
          id,
          data.group_id,
          data.from_user_id,
          data.to_user_id,
          data.amount,
          data.currency || 'USD'
        );
        return id;
      },

      findById: (id: string) => {
        return this.db
          .prepare(
            `
            SELECT
              s.*,
              u_from.name as from_user_name,
              u_from.avatar_url as from_user_avatar,
              u_to.name as to_user_name,
              u_to.avatar_url as to_user_avatar
            FROM settlements s
            JOIN users u_from ON s.from_user_id = u_from.id
            JOIN users u_to ON s.to_user_id = u_to.id
            WHERE s.id = ?
          `
          )
          .get(id);
      },

      findByGroup: (groupId: string, status?: 'pending' | 'completed') => {
        let query = `
          SELECT
            s.*,
            u_from.name as from_user_name,
            u_from.avatar_url as from_user_avatar,
            u_to.name as to_user_name,
            u_to.avatar_url as to_user_avatar
          FROM settlements s
          JOIN users u_from ON s.from_user_id = u_from.id
          JOIN users u_to ON s.to_user_id = u_to.id
          WHERE s.group_id = ?
        `;
        const params: any[] = [groupId];

        if (status) {
          query += ' AND s.status = ?';
          params.push(status);
        }

        query += ' ORDER BY s.created_at DESC';

        return this.db.prepare(query).all(...params);
      },

      markAsCompleted: (id: string) => {
        const stmt = this.db.prepare(
          'UPDATE settlements SET status = ?, settled_at = ? WHERE id = ?'
        );
        stmt.run('completed', Math.floor(Date.now() / 1000), id);
      },
    };
  }

  session() {
    return {
      create: (data: {
        id?: string;
        session_token: string;
        user_id: string;
        expires: number;
      }) => {
        const id = data.id || uuidv4();
        const stmt = this.db.prepare(
          'INSERT INTO sessions (id, session_token, user_id, expires) VALUES (?, ?, ?, ?)'
        );
        stmt.run(id, data.session_token, data.user_id, data.expires);
        return id;
      },

      findByToken: (token: string) => {
        return this.db
          .prepare(
            'SELECT s.*, u.* FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.session_token = ?'
          )
          .get(token);
      },

      deleteExpired: () => {
        const now = Math.floor(Date.now() / 1000);
        const stmt = this.db.prepare('DELETE FROM sessions WHERE expires < ?');
        return stmt.run(now);
      },

      deleteByUserId: (userId: string) => {
        const stmt = this.db.prepare('DELETE FROM sessions WHERE user_id = ?');
        stmt.run(userId);
      },
    };
  }

  transaction<T>(fn: (qb: QueryBuilder) => T): T {
    return this.db.transaction(() => fn(this))();
  }
}

export function createQueryBuilder(db: Database.Database): QueryBuilder {
  return new QueryBuilder(db);
}
