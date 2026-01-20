import { Todo, TodoStorage } from './types';
import { loadTodos, saveTodos } from './storage';

export function addTodo(text: string): Todo {
  const storage = loadTodos();
  const todo: Todo = {
    id: storage.nextId++,
    text,
    completed: false,
    createdAt: new Date()
  };
  storage.todos.push(todo);
  saveTodos(storage);
  return todo;
}

export function listTodos(): Todo[] {
  const storage = loadTodos();
  return storage.todos;
}

export function completeTodo(id: number): Todo | null {
  const storage = loadTodos();
  const todo = storage.todos.find(t => t.id === id);
  if (todo) {
    todo.completed = true;
    saveTodos(storage);
    return todo;
  }
  return null;
}

export function deleteTodo(id: number): Todo | null {
  const storage = loadTodos();
  const index = storage.todos.findIndex(t => t.id === id);
  if (index !== -1) {
    const deletedTodo = storage.todos.splice(index, 1)[0];
    saveTodos(storage);
    return deletedTodo;
  }
  return null;
}
