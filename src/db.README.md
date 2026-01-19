# Database Layer Documentation

This module provides a complete SQLite database layer using better-sqlite3 for the Task Management API.

## Features

- **Synchronous Operations**: Uses better-sqlite3 for fast, synchronous database operations
- **TypeScript Support**: Full type definitions for all database operations
- **Prepared Statements**: All queries use prepared statements for security and performance
- **Soft Delete**: Tasks are archived (soft delete) rather than permanently removed
- **Automatic Timestamps**: Manages created_at and updated_at timestamps automatically
- **Environment Configuration**: Database path configurable via DB_PATH environment variable

## Database Schema

```sql
CREATE TABLE tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  due_date TEXT,
  priority TEXT CHECK(priority IN ('low', 'medium', 'high')),
  archived INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
)
```

## API Reference

### initializeDatabase()

Initializes the SQLite database and creates the tasks table if it doesn't exist.

**Returns:** `DatabaseInstance` - The database instance

**Example:**
```typescript
import { initializeDatabase } from './db';
const db = initializeDatabase();
```

### createTask(taskData)

Creates a new task in the database.

**Parameters:**
- `taskData: CreateTaskInput`
  - `title: string` (required) - Task title
  - `description?: string` - Task description
  - `due_date?: string` - Due date in ISO format
  - `priority?: 'low' | 'medium' | 'high'` - Task priority

**Returns:** `Task` - The created task with generated id and timestamps

**Example:**
```typescript
const task = createTask({
  title: 'Complete project',
  description: 'Finish the task management API',
  due_date: '2026-12-31',
  priority: 'high'
});
```

### getAllTasks(includeArchived?)

Retrieves all tasks from the database.

**Parameters:**
- `includeArchived?: boolean` (default: false) - Whether to include archived tasks

**Returns:** `Task[]` - Array of tasks

**Example:**
```typescript
const activeTasks = getAllTasks();
const allTasks = getAllTasks(true);
```

### getTaskById(id)

Retrieves a single task by its ID.

**Parameters:**
- `id: number` - Task ID

**Returns:** `Task` - The requested task

**Throws:** Error if task not found

**Example:**
```typescript
const task = getTaskById(1);
```

### updateTask(id, updateData)

Updates an existing task by its ID.

**Parameters:**
- `id: number` - Task ID
- `updateData: UpdateTaskInput`
  - `title?: string` - New title
  - `description?: string` - New description
  - `due_date?: string` - New due date
  - `priority?: 'low' | 'medium' | 'high'` - New priority
  - `archived?: number` - Archived flag (0 or 1)

**Returns:** `Task` - The updated task with new updated_at timestamp

**Example:**
```typescript
const updated = updateTask(1, {
  title: 'Updated title',
  priority: 'medium'
});
```

### deleteTask(id)

Soft deletes a task by setting its archived flag to 1.

**Parameters:**
- `id: number` - Task ID

**Returns:** `Task` - The archived task

**Example:**
```typescript
const archived = deleteTask(1);
```

### permanentlyDeleteTask(id)

Permanently removes a task from the database (hard delete).

**Parameters:**
- `id: number` - Task ID

**Returns:** `boolean` - true if successful

**Warning:** This operation cannot be undone.

**Example:**
```typescript
permanentlyDeleteTask(1);
```

### closeDatabase()

Closes the database connection. Should be called during application shutdown.

**Example:**
```typescript
closeDatabase();
```

## Type Definitions

### Task
```typescript
interface Task {
  id: number;
  title: string;
  description?: string;
  due_date?: string;
  priority?: 'low' | 'medium' | 'high';
  archived?: number;
  created_at: string;
  updated_at: string;
}
```

### CreateTaskInput
```typescript
interface CreateTaskInput {
  title: string;
  description?: string;
  due_date?: string;
  priority?: 'low' | 'medium' | 'high';
}
```

### UpdateTaskInput
```typescript
interface UpdateTaskInput {
  title?: string;
  description?: string;
  due_date?: string;
  priority?: 'low' | 'medium' | 'high';
  archived?: number;
}
```

## Environment Variables

- `DB_PATH`: Path to the SQLite database file (default: `./tasks.db`)

## Usage Example

```typescript
import * as db from './db';

// Initialize
db.initializeDatabase();

// Create task
const task = db.createTask({
  title: 'Build API',
  description: 'Create REST API endpoints',
  priority: 'high'
});

// Get all active tasks
const tasks = db.getAllTasks();

// Update task
db.updateTask(task.id, { title: 'Build REST API' });

// Soft delete
db.deleteTask(task.id);

// Close connection
db.closeDatabase();
```
