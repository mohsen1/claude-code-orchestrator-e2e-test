import { Router, Request, Response } from 'express';
import { z } from 'zod';
import db from '../db';
import { validateRequest } from '../middleware/validation';

const router = Router();

// Validation schemas
const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  due_date: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
});

const updateTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  description: z.string().optional(),
  due_date: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  archived: z.boolean().optional(),
});

// GET /api/tasks - Get all tasks
router.get('/', (req: Request, res: Response) => {
  const tasks = db.getAllTasks();
  res.json(tasks);
});

// GET /api/tasks/:id - Get task by ID
router.get('/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid task ID' });
  }

  const task = db.getTaskById(id);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  res.json(task);
});

// POST /api/tasks - Create new task
router.post('/', validateRequest(createTaskSchema), (req: Request, res: Response) => {
  const task = db.createTask(req.body);
  res.status(201).json(task);
});

// PUT /api/tasks/:id - Update task
router.put('/:id', validateRequest(updateTaskSchema), (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid task ID' });
  }

  const task = db.updateTask(id, req.body);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  res.json(task);
});

// DELETE /api/tasks/:id - Delete task (soft delete)
router.delete('/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid task ID' });
  }

  const task = db.deleteTask(id);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  res.status(200).json({ message: 'Task deleted successfully', task });
});

export default router;
