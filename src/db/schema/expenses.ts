import {
  sqliteTable,
  text,
  integer,
  index,
} from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { groups } from './groups';
import { users } from './users';

export const expenses = sqliteTable(
  'expenses',
  {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    groupId: text('group_id')
      .notNull()
      .references(() => groups.id, { onDelete: 'cascade' }),
    payerId: text('payer_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    amount: integer('amount').notNull(), // Stored in cents/lowest unit (Integer)
    description: text('description').notNull(),
    date: integer('date', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => ({
    groupIdIdx: index('expenses_group_id_idx').on(table.groupId),
    payerIdIdx: index('expenses_payer_id_idx').on(table.payerId),
    dateIdx: index('expenses_date_idx').on(table.date),
  })
);

// Expense Splits Junction Table
export const expenseSplits = sqliteTable(
  'expense_splits',
  {
    expenseId: text('expense_id')
      .notNull()
      .references(() => expenses.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    amount: integer('amount').notNull(), // The exact amount this person owes (in cents)
  },
  (table) => ({
    primaryKey: index('expense_splits_pk').on(table.expenseId, table.userId),
    userIdIdx: index('expense_splits_user_id_idx').on(table.userId),
  })
);

// Types
export type Expense = typeof expenses.$inferSelect;
export type NewExpense = typeof expenses.$inferInsert;
export type ExpenseSplit = typeof expenseSplits.$inferSelect;
export type NewExpenseSplit = typeof expenseSplits.$inferInsert;
