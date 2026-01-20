import Database from 'better-sqlite3';
import { UserModel } from './models/User';
import { GroupModel } from './models/Group';
import path from 'path';

let db: Database.Database | null = null;
let userModel: UserModel | null = null;
let groupModel: GroupModel | null = null;

export function getDatabase(dbPath: string = './expenses.db'): Database.Database {
  if (!db) {
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

export function getUserModel(): UserModel {
  if (!userModel) {
    const database = getDatabase();
    userModel = new UserModel(database);
  }
  return userModel;
}

export function getGroupModel(): GroupModel {
  if (!groupModel) {
    const database = getDatabase();
    groupModel = new GroupModel(database);
  }
  return groupModel;
}

export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
    userModel = null;
    groupModel = null;
  }
}

export function initializeDatabase(dbPath?: string): { user: UserModel; group: GroupModel } {
  const database = getDatabase(dbPath);
  const user = new UserModel(database);
  const group = new GroupModel(database);
  return { user, group };
}
