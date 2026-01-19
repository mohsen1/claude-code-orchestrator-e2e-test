# Middleware Usage Examples

This file demonstrates how to use the validation and error middleware in your Task Management API.

## Import the Middleware

```typescript
import express from 'express';
import {
  validateRequest,
  createTaskSchema,
  updateTaskSchema,
  errorHandler,
  notFoundHandler,
  asyncHandler,
  AppError
} from './middleware';
```

## Using Validation Middleware

### Create Task Route Example

```typescript
router.post(
  '/tasks',
  validateRequest(createTaskSchema),  // Validate request body
  asyncHandler(async (req, res) => {
    // req.body is now validated and typed
    const { title, description, due_date, priority } = req.body;

    // Create task logic here
    const task = await db.createTask({
      title,
      description,
      due_date,
      priority
    });

    res.status(201).json(task);
  })
);
```

### Update Task Route Example

```typescript
router.put(
  '/tasks/:id',
  validateRequest(updateTaskSchema),  // All fields optional
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updates = req.body;  // Only includes fields that were provided

    const task = await db.updateTask(id, updates);

    if (!task) {
      throw new AppError('Task not found', 404);
    }

    res.json(task);
  })
);
```

## Setting Up Error Handling

### In your main app file (index.ts):

```typescript
import express from 'express';
import { errorHandler, notFoundHandler } from './middleware';
import taskRoutes from './routes/tasks';

const app = express();

// Parse JSON bodies
app.use(express.json());

// API routes
app.use('/api', taskRoutes);

// 404 handler - must be after all routes
app.use(notFoundHandler);

// Global error handler - must be last
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

## Throwing Errors

### Using AppError class:

```typescript
import { AppError } from './middleware';

router.get('/tasks/:id', asyncHandler(async (req, res) => {
  const task = await db.getTaskById(req.params.id);

  if (!task) {
    throw new AppError('Task not found', 404);
  }

  res.json(task);
}));
```

### Automatic error handling:

The `asyncHandler` wrapper automatically catches errors and passes them to the error middleware, so you don't need try-catch blocks:

```typescript
// WITHOUT asyncHandler (needs try-catch):
router.get('/tasks/:id', async (req, res, next) => {
  try {
    const task = await db.getTaskById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.json(task);
  } catch (error) {
    next(error);
  }
});

// WITH asyncHandler (cleaner):
router.get('/tasks/:id', asyncHandler(async (req, res) => {
  const task = await db.getTaskById(req.params.id);
  if (!task) {
    throw new AppError('Task not found', 404);
  }
  res.json(task);
}));
```

## Validation Schema Details

### createTaskSchema
- **title**: required string, 1-200 characters
- **description**: optional string, max 1000 characters
- **due_date**: optional ISO datetime string
- **priority**: optional enum ('low' | 'medium' | 'high')

### updateTaskSchema
- Same fields as createTaskSchema, but all are optional

### Example Valid Requests

**Create Task:**
```json
{
  "title": "Complete project",
  "description": "Finish the task management API",
  "due_date": "2024-12-31T23:59:59Z",
  "priority": "high"
}
```

**Update Task:**
```json
{
  "status": "in_progress",
  "priority": "medium"
}
```

### Error Response Format

**Validation Error (400):**
```json
{
  "error": "title: Title is required, priority: Priority must be one of: low, medium, high"
}
```

**Not Found (404):**
```json
{
  "error": "Route GET /api/taskss not found"
}
```

**Server Error (500):**
```json
{
  "error": "Internal server error"
}
```

## Complete Route Example

```typescript
import { Router } from 'express';
import {
  validateRequest,
  createTaskSchema,
  updateTaskSchema,
  asyncHandler,
  AppError
} from '../middleware';

const router = Router();

// Create task
router.post(
  '/tasks',
  validateRequest(createTaskSchema),
  asyncHandler(async (req, res) => {
    const task = await db.createTask(req.body);
    res.status(201).json(task);
  })
);

// Get all tasks
router.get(
  '/tasks',
  asyncHandler(async (req, res) => {
    const tasks = await db.getAllTasks();
    res.json(tasks);
  })
);

// Get single task
router.get(
  '/tasks/:id',
  asyncHandler(async (req, res) => {
    const task = await db.getTaskById(req.params.id);
    if (!task) {
      throw new AppError('Task not found', 404);
    }
    res.json(task);
  })
);

// Update task
router.put(
  '/tasks/:id',
  validateRequest(updateTaskSchema),
  asyncHandler(async (req, res) => {
    const task = await db.updateTask(req.params.id, req.body);
    if (!task) {
      throw new AppError('Task not found', 404);
    }
    res.json(task);
  })
);

// Delete task
router.delete(
  '/tasks/:id',
  asyncHandler(async (req, res) => {
    const task = await db.deleteTask(req.params.id);
    if (!task) {
      throw new AppError('Task not found', 404);
    }
    res.json({ message: 'Task deleted successfully' });
  })
);

export default router;
```
