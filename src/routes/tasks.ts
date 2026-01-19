import { Router, Request, Response } from 'express';
import { z } from 'zod';
import {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
} from '../db';
import { validateRequestBody, validateRequestParams } from '../middleware/validation';
import { AppError } from '../middleware/error';

const router = Router();

// Validation schemas
const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  description: z.string().optional(),
  due_date: z.string().datetime().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional().default('medium')
});

const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  due_date: z.string().datetime().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  archived: z.boolean().optional()
});

const taskParamsSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID must be a number').transform(Number)
});

// GET /api/tasks - List all tasks
router.get('/', (req: Request, res: Response): void => {
  try {
    const tasks = getAllTasks();
    res.json({
      success: true,
      data: tasks,
      count: tasks.length
    });
  } catch (error) {
    throw new AppError(500, 'Failed to retrieve tasks');
  }
});

// GET /api/tasks/:id - Get single task
router.get('/:id',
  validateRequestParams(taskParamsSchema),
  (req: Request, res: Response): void => {
    const { id } = req.params;

    const task = getTaskById(id);
    if (!task) {
      throw new AppError(404, 'Task not found');
    }

    res.json({
      success: true,
      data: task
    });
  }
);

// POST /api/tasks - Create new task
router.post('/',
  validateRequestBody(createTaskSchema),
  (req: Request, res: Response): void => {
    const { title, description, due_date, priority } = req.body;

    const newTask = createTask({
      title,
      description,
      due_date,
      priority: priority || 'medium',
      archived: false
    });

    res.status(201).json({
      success: true,
      data: newTask
    });
  }
);

// PUT /api/tasks/:id - Update task
router.put('/:id',
  validateRequestParams(taskParamsSchema),
  validateRequestBody(updateTaskSchema),
  (req: Request, res: Response): void => {
    const { id } = req.params;
    const updates = req.body;

    const updatedTask = updateTask(id, updates);
    if (!updatedTask) {
      throw new AppError(404, 'Task not found');
    }

    res.json({
      success: true,
      data: updatedTask
    });
  }
);

// DELETE /api/tasks/:id - Soft delete task (archive)
router.delete('/:id',
  validateRequestParams(taskParamsSchema),
  (req: Request, res: Response): void => {
    const { id } = req.params;

    const deleted = deleteTask(id);
    if (!deleted) {
      throw new AppError(404, 'Task not found');
    }

    res.status(200).json({
      success: true,
      message: 'Task archived successfully'
    });
  }
);

export default router;
