import { getUserRepository } from '../db';

interface TestUser {
  name: string;
  email: string;
  password: string;
}

const TEST_USERS: TestUser[] = [
  {
    name: 'Alice Johnson',
    email: 'alice@example.com',
    password: 'Password123',
  },
  {
    name: 'Bob Smith',
    email: 'bob@example.com',
    password: 'Password123',
  },
  {
    name: 'Carol Williams',
    email: 'carol@example.com',
    password: 'Password123',
  },
  {
    name: 'David Brown',
    email: 'david@example.com',
    password: 'Password123',
  },
  {
    name: 'Eve Davis',
    email: 'eve@example.com',
    password: 'Password123',
  },
];

/**
 * Seed the database with test users
 */
export async function seedDatabase(): Promise<void> {
  const userRepo = getUserRepository();

  console.log('🌱 Seeding database...');

  // Check if database is already seeded
  const existingUserCount = userRepo.count();
  if (existingUserCount > 0) {
    console.log(`✅ Database already contains ${existingUserCount} user(s). Skipping seed.`);
    return;
  }

  // Create test users
  for (const userData of TEST_USERS) {
    try {
      const user = userRepo.create(userData);
      console.log(`✅ Created user: ${user.name} (${user.email})`);
    } catch (error: any) {
      if (error.code === 'SQLITE_CONSTRAINT') {
        console.log(`⚠️  User already exists: ${userData.email}`);
      } else {
        console.error(`❌ Error creating user ${userData.email}:`, error.message);
      }
    }
  }

  console.log('🎉 Database seeding complete!');
}

/**
 * Reset the database (delete all users)
 * WARNING: This will delete all data
 */
export async function resetDatabase(): Promise<void> {
  const userRepo = getUserRepository();

  console.log('🗑️  Resetting database...');

  // Get all users
  const users = userRepo.findAll();

  // Delete all users (cascade will delete related data)
  for (const user of users) {
    const deleted = userRepo.delete(user.id);
    if (deleted) {
      console.log(`🗑️  Deleted user: ${user.name} (${user.email})`);
    }
  }

  console.log('✅ Database reset complete!');
}

/**
 * Run seed from command line
 */
if (require.main === module) {
  const command = process.argv[2];

  if (command === 'seed') {
    seedDatabase()
      .then(() => {
        console.log('✅ Seed completed successfully');
        process.exit(0);
      })
      .catch((error) => {
        console.error('❌ Seed failed:', error);
        process.exit(1);
      });
  } else if (command === 'reset') {
    resetDatabase()
      .then(() => {
        console.log('✅ Reset completed successfully');
        process.exit(0);
      })
      .catch((error) => {
        console.error('❌ Reset failed:', error);
        process.exit(1);
      });
  } else {
    console.log('Usage:');
    console.log('  node dist/lib/seed.js seed   - Seed the database with test users');
    console.log('  node dist/lib/seed.js reset  - Reset the database (delete all data)');
    process.exit(1);
  }
}
