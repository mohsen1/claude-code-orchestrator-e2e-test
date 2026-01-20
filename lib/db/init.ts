import { db } from './index';

let initialized = false;

export async function initializeDatabase() {
  if (initialized) {
    return;
  }

  try {
    // This will be called on first API request or server action
    // The tables will be created by the migrate.ts file
    initialized = true;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

// Export a function to check if database is ready
export function isDatabaseReady(): boolean {
  return initialized;
}
