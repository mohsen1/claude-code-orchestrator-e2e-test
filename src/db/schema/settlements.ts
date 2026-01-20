import {
  sqliteTable,
  text,
  integer,
  index,
} from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { groups } from './groups';
import { users } from './users';

export const settlements = sqliteTable(
  'settlements',
  {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    groupId: text('group_id')
      .notNull()
      .references(() => groups.id, { onDelete: 'cascade' }),
    fromUserId: text('from_user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    toUserId: text('to_user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    amount: integer('amount').notNull(), // Stored in cents/lowest unit (Integer)
    status: text('status').notNull().default('pending'), // 'pending', 'completed', 'cancelled'
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
    completedAt: integer('completed_at', { mode: 'timestamp' }),
  },
  (table) => ({
    groupIdIdx: index('settlements_group_id_idx').on(table.groupId),
    fromUserIdIdx: index('settlements_from_user_id_idx').on(table.fromUserId),
    toUserIdIdx: index('settlements_to_user_id_idx').on(table.toUserId),
    statusIdx: index('settlements_status_idx').on(table.status),
  })
);

// Types
export type Settlement = typeof settlements.$inferSelect;
export type NewSettlement = typeof settlements.$inferInsert;
