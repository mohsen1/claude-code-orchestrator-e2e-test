import { db } from './index';
import { users, groups, groupMembers, expenses, expenseSplits, settlements } from './schema';
import { generateId } from '@/lib/utils';

/**
 * Seed database with initial test data
 * This file is used by: npm run db:seed
 */

async function seed() {
  console.log('🌱 Starting database seed...');

  try {
    // Clear existing data
    await db.delete(settlements);
    await db.delete(expenseSplits);
    await db.delete(expenses);
    await db.delete(groupMembers);
    await db.delete(groups);
    await db.delete(users);

    console.log('✅ Cleared existing data');

    // Create test users
    const user1Id = generateId();
    const user2Id = generateId();
    const user3Id = generateId();

    await db.insert(users).values([
      {
        id: user1Id,
        name: 'Alice Johnson',
        email: 'alice@example.com',
        image: null,
      },
      {
        id: user2Id,
        name: 'Bob Smith',
        email: 'bob@example.com',
        image: null,
      },
      {
        id: user3Id,
        name: 'Charlie Brown',
        email: 'charlie@example.com',
        image: null,
      },
    ]);

    console.log('✅ Created test users');

    // Create a test group
    const groupId = generateId();
    await db.insert(groups).values({
      id: groupId,
      name: 'Roommates',
      description: 'Shared expenses for apartment',
      createdBy: user1Id,
    });

    console.log('✅ Created test group');

    // Add members to the group
    await db.insert(groupMembers).values([
      {
        id: generateId(),
        groupId,
        userId: user1Id,
        role: 'admin',
      },
      {
        id: generateId(),
        groupId,
        userId: user2Id,
        role: 'member',
      },
      {
        id: generateId(),
        groupId,
        userId: user3Id,
        role: 'member',
      },
    ]);

    console.log('✅ Added group members');

    // Create test expenses
    const expense1Id = generateId();
    const expense2Id = generateId();
    const expense3Id = generateId();

    await db.insert(expenses).values([
      {
        id: expense1Id,
        groupId,
        description: 'Groceries',
        amount: 15000, // $150.00 in cents
        paidBy: user1Id,
        category: 'Food',
      },
      {
        id: expense2Id,
        groupId,
        description: 'Electric Bill',
        amount: 12000, // $120.00 in cents
        paidBy: user2Id,
        category: 'Utilities',
      },
      {
        id: expense3Id,
        groupId,
        description: 'Internet',
        amount: 8000, // $80.00 in cents
        paidBy: user3Id,
        category: 'Utilities',
      },
    ]);

    console.log('✅ Created test expenses');

    // Create expense splits (equal split)
    const splitAmount1 = 15000 / 3; // 5000 cents each
    const splitAmount2 = 12000 / 3; // 4000 cents each
    const splitAmount3 = 8000 / 3; // 2667 cents each

    await db.insert(expenseSplits).values([
      // Expense 1 splits
      {
        id: generateId(),
        expenseId: expense1Id,
        userId: user1Id,
        amount: Math.round(splitAmount1),
        percentage: 33.33,
      },
      {
        id: generateId(),
        expenseId: expense1Id,
        userId: user2Id,
        amount: Math.round(splitAmount1),
        percentage: 33.33,
      },
      {
        id: generateId(),
        expenseId: expense1Id,
        userId: user3Id,
        amount: Math.round(splitAmount1),
        percentage: 33.34,
      },
      // Expense 2 splits
      {
        id: generateId(),
        expenseId: expense2Id,
        userId: user1Id,
        amount: Math.round(splitAmount2),
        percentage: 33.33,
      },
      {
        id: generateId(),
        expenseId: expense2Id,
        userId: user2Id,
        amount: Math.round(splitAmount2),
        percentage: 33.33,
      },
      {
        id: generateId(),
        expenseId: expense2Id,
        userId: user3Id,
        amount: Math.round(splitAmount2),
        percentage: 33.34,
      },
      // Expense 3 splits
      {
        id: generateId(),
        expenseId: expense3Id,
        userId: user1Id,
        amount: Math.round(splitAmount3),
        percentage: 33.33,
      },
      {
        id: generateId(),
        expenseId: expense3Id,
        userId: user2Id,
        amount: Math.round(splitAmount3),
        percentage: 33.33,
      },
      {
        id: generateId(),
        expenseId: expense3Id,
        userId: user3Id,
        amount: Math.round(splitAmount3),
        percentage: 33.34,
      },
    ]);

    console.log('✅ Created expense splits');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log('  - 3 users created');
    console.log('  - 1 group created');
    console.log('  - 3 group members added');
    console.log('  - 3 expenses created');
    console.log('  - 9 expense splits created');
    console.log('\n🔐 Test Accounts:');
    console.log('  - alice@example.com (Alice Johnson)');
    console.log('  - bob@example.com (Bob Smith)');
    console.log('  - charlie@example.com (Charlie Brown)');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run seed function
seed()
  .then(() => {
    console.log('\n✨ Seed completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Seed failed:', error);
    process.exit(1);
  });
