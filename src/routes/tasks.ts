import { Router, Request, Response } from 'express';
import {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  softDeleteTask
} from '../db';
import { validateCreateTask, validateUpdateTask } from '../middleware/validation';
import { AppError } from '../middleware/error';
import { Task, CreateTaskInput, UpdateTaskInput } from '../models/task';

const router = Router();

// Helper function to convert database row to Task response
function toTaskResponse(row: any): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description || undefined,
    due_date: row.due_date || undefined,
    priority: row.priority as 'low' | 'medium' | 'high',
    archived: row.archived === 1,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

// GET / - List all tasks
router.get('/', (req: Request, res: Response) => {
  try {
    const tasks = getAllTasks();
    const taskResponses = tasks.map(toTaskResponse);
    res.status(200).json({
      success: true,
      data: taskResponses,
      count: taskResponses.length
    });
  } catch (error) {
    throw new AppError(500, 'Failed to retrieve tasks');
  }
});

// GET /:id - Get a single task by ID
router.get('/:id', (req: Request, res: Response) => {
  try {
    const taskId = parseInt(req.params.id, 10);

    if (isNaN(taskId)) {
      throw new AppError(400, 'Invalid task ID');
    }

    const task = getTaskById(taskId);

    if (!task) {
      throw new AppError(404, `Task with ID ${taskId} not found`);
    }

    res.status(200).json({
      success: true,
      data: toTaskResponse(task)
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(500, 'Failed to retrieve task');
  }
});

// POST / - Create a new task
router.post('/', validateCreateTask, (req: Request, res: Response) => {
  try {
    const input: CreateTaskInput = req.body;
    const newTask = createTask({
      title: input.title,
      description: input.description,
      due_date: input.due_date,
      priority: input.priority || 'medium'
    });

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: toTaskResponse(newTask)
    });
  } catch (error) {
    throw new AppError(500, 'Failed to create task');
  }
});

// PUT /:id - Update an existing task
router.put('/:id', validateUpdateTask, (req: Request, res: Response) => {
  try {
    const taskId = parseInt(req.params.id, 10);

    if (isNaN(taskId)) {
      throw new AppError(400, 'Invalid task ID');
    }

    // Check if task exists
    const existingTask = getTaskById(taskId);
    if (!existingTask) {
      throw new AppError(404, `Task with ID ${taskId} not found`);
    }

    const input: UpdateTaskInput = req.body;
    const updatedTask = updateTask(taskId, {
      title: input.title,
      description: input.description,
      due_date: input.due_date,
      priority: input.priority
    });

    if (!updatedTask) {
      throw new AppError(500, 'Failed to update task');
    }

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: toTaskResponse(updatedTask)
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(500, 'Failed to update task');
  }
});

// DELETE /:id - Soft delete a task (archive it)
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const taskId = parseInt(req.params.id, 10);

    if (isNaN(taskId)) {
      throw new AppError(400, 'Invalid task ID');
    }

    // Check if task exists
    const existingTask = getTaskById(taskId);
    if (!existingTask) {
      throw new AppError(404, `Task with ID ${taskId} not found`);
    }

    const deletedTask = softDeleteTask(taskId);

    if (!deletedTask) {
      throw new AppError(500, 'Failed to delete task');
    }

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
      data: toTaskResponse(deletedTask)
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(500, 'Failed to delete task');
  }
});

export default router;
