import Database from 'better-sqlite3';
import { ExpenseRepository } from './ExpenseRepository';
import { GroupRepository } from './GroupRepository';
import { User, Group, GroupMember, Expense, ExpenseSplit, Settlement } from './schema';

export class SeedData {
  constructor(private db: Database.Database) {}

  async seedUsers(): Promise<User[]> {
    const users: User[] = [
      {
        id: 'user-1',
        email: 'alice@example.com',
        name: 'Alice Johnson',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
        created_at: Date.now() - 30 * 24 * 60 * 60 * 1000,
      },
      {
        id: 'user-2',
        email: 'bob@example.com',
        name: 'Bob Smith',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
        created_at: Date.now() - 29 * 24 * 60 * 60 * 1000,
      },
      {
        id: 'user-3',
        email: 'charlie@example.com',
        name: 'Charlie Brown',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie',
        created_at: Date.now() - 28 * 24 * 60 * 60 * 1000,
      },
      {
        id: 'user-4',
        email: 'diana@example.com',
        name: 'Diana Prince',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Diana',
        created_at: Date.now() - 27 * 24 * 60 * 60 * 1000,
      },
      {
        id: 'user-5',
        email: 'evan@example.com',
        name: 'Evan Wright',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Evan',
        created_at: Date.now() - 26 * 24 * 60 * 60 * 1000,
      },
    ];

    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO users (id, email, name, avatar, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);

    const insertUsers = this.db.transaction(() => {
      for (const user of users) {
        stmt.run(user.id, user.email, user.name, user.avatar, user.created_at);
      }
    });

    insertUsers();
    console.log('✓ Seeded users');
    return users;
  }

  async seedGroups(users: User[]): Promise<Group[]> {
    const groupRepo = new GroupRepository(this.db);

    const groups: Group[] = [
      {
        id: 'group-1',
        name: 'Apartment 4B',
        description: 'Shared apartment expenses',
        currency: 'USD',
        created_by: 'user-1',
        created_at: Date.now() - 25 * 24 * 60 * 60 * 1000,
      },
      {
        id: 'group-2',
        name: 'Europe Trip 2024',
        description: 'Summer vacation to Europe',
        currency: 'EUR',
        created_by: 'user-2',
        created_at: Date.now() - 20 * 24 * 60 * 60 * 1000,
      },
      {
        id: 'group-3',
        name: 'Office Lunch Club',
        description: 'Friday team lunches',
        currency: 'USD',
        created_by: 'user-3',
        created_at: Date.now() - 15 * 24 * 60 * 60 * 1000,
      },
    ];

    for (const group of groups) {
      const { id, created_at, created_by, ...groupData } = group;
      const created = groupRepo.createGroup(groupData);
    }

    console.log('✓ Seeded groups');
    return groups;
  }

  async seedGroupMembers(users: User[], groups: Group[]): Promise<GroupMember[]> {
    const groupRepo = new GroupRepository(this.db);

    const members: Array<Omit<GroupMember, 'id' | 'joined_at'>> = [
      // Apartment 4B members
      { group_id: 'group-1', user_id: 'user-1', role: 'admin' },
      { group_id: 'group-1', user_id: 'user-2', role: 'member' },
      { group_id: 'group-1', user_id: 'user-3', role: 'member' },

      // Europe Trip members
      { group_id: 'group-2', user_id: 'user-2', role: 'admin' },
      { group_id: 'group-2', user_id: 'user-1', role: 'member' },
      { group_id: 'group-2', user_id: 'user-4', role: 'member' },
      { group_id: 'group-2', user_id: 'user-5', role: 'member' },

      // Office Lunch Club members
      { group_id: 'group-3', user_id: 'user-3', role: 'admin' },
      { group_id: 'group-3', user_id: 'user-2', role: 'member' },
      { group_id: 'group-3', user_id: 'user-4', role: 'member' },
    ];

    for (const member of members) {
      groupRepo.addMember(member);
    }

    console.log('✓ Seeded group members');
    return members.map((m, i) => ({ ...m, id: `member-${i + 1}`, joined_at: Date.now() }));
  }

  async seedExpenses(groups: Group[]): Promise<Expense[]> {
    const expenseRepo = new ExpenseRepository(this.db);

    const expensesData: Array<{ expense: Omit<Expense, 'id' | 'created_at'>; splits: Array<{ user_id: string; amount: number; percentage: number }> }> = [
      // Apartment 4B expenses
      {
        expense: {
          group_id: 'group-1',
          description: 'Monthly Rent',
          amount: 2400,
          paid_by: 'user-1',
          category: 'Rent',
          date: Date.now() - 5 * 24 * 60 * 60 * 1000,
        },
        splits: [
          { user_id: 'user-1', amount: 800, percentage: 33.33 },
          { user_id: 'user-2', amount: 800, percentage: 33.33 },
          { user_id: 'user-3', amount: 800, percentage: 33.34 },
        ],
      },
      {
        expense: {
          group_id: 'group-1',
          description: 'Groceries - Whole Foods',
          amount: 185.50,
          paid_by: 'user-2',
          category: 'Groceries',
          date: Date.now() - 3 * 24 * 60 * 60 * 1000,
        },
        splits: [
          { user_id: 'user-1', amount: 61.83, percentage: 33.33 },
          { user_id: 'user-2', amount: 61.84, percentage: 33.34 },
          { user_id: 'user-3', amount: 61.83, percentage: 33.33 },
        ],
      },
      {
        expense: {
          group_id: 'group-1',
          description: 'Electric Bill',
          amount: 145.20,
          paid_by: 'user-3',
          category: 'Utilities',
          date: Date.now() - 1 * 24 * 60 * 60 * 1000,
        },
        splits: [
          { user_id: 'user-1', amount: 48.40, percentage: 33.33 },
          { user_id: 'user-2', amount: 48.40, percentage: 33.34 },
          { user_id: 'user-3', amount: 48.40, percentage: 33.33 },
        ],
      },

      // Europe Trip expenses
      {
        expense: {
          group_id: 'group-2',
          description: 'Hotel Paris - 3 nights',
          amount: 840,
          paid_by: 'user-2',
          category: 'Accommodation',
          date: Date.now() - 10 * 24 * 60 * 60 * 1000,
        },
        splits: [
          { user_id: 'user-1', amount: 210, percentage: 25 },
          { user_id: 'user-2', amount: 210, percentage: 25 },
          { user_id: 'user-4', amount: 210, percentage: 25 },
          { user_id: 'user-5', amount: 210, percentage: 25 },
        ],
      },
      {
        expense: {
          group_id: 'group-2',
          description: 'Train tickets Paris to Rome',
          amount: 520,
          paid_by: 'user-1',
          category: 'Transportation',
          date: Date.now() - 8 * 24 * 60 * 60 * 1000,
        },
        splits: [
          { user_id: 'user-1', amount: 130, percentage: 25 },
          { user_id: 'user-2', amount: 130, percentage: 25 },
          { user_id: 'user-4', amount: 130, percentage: 25 },
          { user_id: 'user-5', amount: 130, percentage: 25 },
        ],
      },
      {
        expense: {
          group_id: 'group-2',
          description: 'Group dinner in Rome',
          amount: 320,
          paid_by: 'user-4',
          category: 'Food & Drink',
          date: Date.now() - 6 * 24 * 60 * 60 * 1000,
        },
        splits: [
          { user_id: 'user-1', amount: 80, percentage: 25 },
          { user_id: 'user-2', amount: 80, percentage: 25 },
          { user_id: 'user-4', amount: 80, percentage: 25 },
          { user_id: 'user-5', amount: 80, percentage: 25 },
        ],
      },

      // Office Lunch Club expenses
      {
        expense: {
          group_id: 'group-3',
          description: 'Friday Pizza',
          amount: 75,
          paid_by: 'user-3',
          category: 'Food & Drink',
          date: Date.now() - 2 * 24 * 60 * 60 * 1000,
        },
        splits: [
          { user_id: 'user-2', amount: 25, percentage: 33.33 },
          { user_id: 'user-3', amount: 25, percentage: 33.34 },
          { user_id: 'user-4', amount: 25, percentage: 33.33 },
        ],
      },
      {
        expense: {
          group_id: 'group-3',
          description: 'Sushi Thursday',
          amount: 120,
          paid_by: 'user-4',
          category: 'Food & Drink',
          date: Date.now() - 7 * 24 * 60 * 60 * 1000,
        },
        splits: [
          { user_id: 'user-2', amount: 40, percentage: 33.33 },
          { user_id: 'user-3', amount: 40, percentage: 33.34 },
          { user_id: 'user-4', amount: 40, percentage: 33.33 },
        ],
      },
    ];

    const expenses: Expense[] = [];

    for (const { expense, splits } of expensesData) {
      const created = expenseRepo.createExpense(expense, splits);
      expenses.push(created);
    }

    console.log('✓ Seeded expenses');
    return expenses;
  }

  async seedSettlements(groups: Group[]): Promise<Settlement[]> {
    const expenseRepo = new ExpenseRepository(this.db);

    const settlements: Omit<Settlement, 'id' | 'created_at'>[] = [
      {
        group_id: 'group-1',
        from_user_id: 'user-2',
        to_user_id: 'user-1',
        amount: 28.44,
        status: 'pending',
      },
      {
        group_id: 'group-1',
        from_user_id: 'user-3',
        to_user_id: 'user-1',
        amount: 28.44,
        status: 'pending',
      },
      {
        group_id: 'group-2',
        from_user_id: 'user-1',
        to_user_id: 'user-2',
        amount: 80,
        status: 'completed',
      },
    ];

    const created: Settlement[] = [];

    for (const settlement of settlements) {
      const result = expenseRepo.createSettlement(settlement);
      if (settlement.status === 'completed') {
        expenseRepo.updateSettlementStatus(result.id, 'completed');
      }
      created.push(result);
    }

    console.log('✓ Seeded settlements');
    return created;
  }

  async seedAll(): Promise<void> {
    console.log('Starting database seed...');

    const seed = this.db.transaction(async () => {
      const users = await this.seedUsers();
      const groups = await this.seedGroups(users);
      await this.seedGroupMembers(users, groups);
      await this.seedExpenses(groups);
      await this.seedSettlements(groups);

      console.log('✓ Database seeding completed');
    });

    seed();
  }

  async clear(): Promise<void> {
    const clear = this.db.transaction(() => {
      this.db.exec('DELETE FROM settlements');
      this.db.exec('DELETE FROM expense_splits');
      this.db.exec('DELETE FROM expenses');
      this.db.exec('DELETE FROM group_members');
      this.db.exec('DELETE FROM groups');
      this.db.exec('DELETE FROM users');
      console.log('✓ Database cleared');
    });

    clear();
  }
}
