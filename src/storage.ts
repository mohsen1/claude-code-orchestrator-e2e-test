import * as fs from 'fs';
import * as path from 'path';
import { Todo } from './types';

const TODO_FILE = 'todos.json';

function getFilePath(): string {
  return path.join(process.cwd(), TODO_FILE);
}

export function loadTodos(): Todo[] {
  const filePath = getFilePath();

  if (!fs.existsSync(filePath)) {
    return [];
  }

  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    const todos = JSON.parse(data) as Todo[];

    // Convert date strings back to Date objects
    return todos.map(todo => ({
      ...todo,
      createdAt: new Date(todo.createdAt)
    }));
  } catch (error) {
    console.error('Error loading todos:', error);
    return [];
  }
}

export function saveTodos(todos: Todo[]): void {
  const filePath = getFilePath();

  try {
    fs.writeFileSync(filePath, JSON.stringify(todos, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving todos:', error);
    throw error;
  }
}
