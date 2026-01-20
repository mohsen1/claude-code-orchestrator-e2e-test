import { initializeDatabase } from './schema';
import migrations from './migrations';

// Auto-initialize database when this module is imported
let dbInitialized = false;

export function initDb() {
  if (!dbInitialized) {
    console.log('Initializing database...');
    migrations.setupDatabase();
    dbInitialized = true;
    console.log('Database initialized successfully');
  }
  return dbInitialized;
}

// Auto-initialize on import
initDb();

export * from './schema';
export * from './expenses';
export * from './migrations';
export { default as db } from './schema';
