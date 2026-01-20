import * as fs from 'fs';
import * as path from 'path';
import { Todo, TodoStorage } from './types';

const STORAGE_FILE = path.join(process.cwd(), 'todos.json');

export function loadTodos(): TodoStorage {
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      const data = fs.readFileSync(STORAGE_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      return {
        todos: parsed.todos || [],
        nextId: parsed.nextId || 1
      };
    }
  } catch (error) {
    console.error('Error loading todos:', error);
  }
  return { todos: [], nextId: 1 };
}

export function saveTodos(storage: TodoStorage): void {
  try {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(storage, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving todos:', error);
  }
}

export function getStoragePath(): string {
  return STORAGE_FILE;
}
