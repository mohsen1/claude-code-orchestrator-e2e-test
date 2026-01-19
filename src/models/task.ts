export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: number;
  title: string;
  description: string | null;
  due_date: string | null;
  priority: Priority;
  created_at: string;
  updated_at: string;
  archived: number;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  due_date?: string;
  priority?: Priority;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  due_date?: string;
  priority?: Priority;
}
