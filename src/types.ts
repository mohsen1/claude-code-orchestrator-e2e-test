export interface Todo {
  id: number;
  text: string;
  completed: boolean;
  createdAt: Date;
}

export interface TodoStorage {
  todos: Todo[];
  nextId: number;
}
