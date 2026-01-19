import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { Priority } from '../models/task';

// Zod schema for priority
const prioritySchema = z.enum(['low', 'medium', 'high'], {
  errorMap: () => ({ message: 'Priority must be one of: low, medium, high' })
});

// Zod schema for creating a task
export const createTaskSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  description: z.string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),
  due_date: z.string()
    .datetime('Invalid date format. Use ISO 8601 format')
    .optional()
    .nullable(),
  priority: prioritySchema.optional()
});

// Zod schema for updating a task (all fields optional)
export const updateTaskSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters')
    .optional(),
  description: z.string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional()
    .nullable(),
  due_date: z.string()
    .datetime('Invalid date format. Use ISO 8601 format')
    .optional()
    .nullable(),
  priority: prioritySchema.optional()
});

// Validation middleware factory
export const validate = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message
        }));
        res.status(400).json({
          error: 'Validation failed',
          details: errors
        });
      } else {
        res.status(400).json({
          error: 'Invalid request data'
        });
      }
    }
  };
};

export const validateCreateTask = validate(createTaskSchema);
export const validateUpdateTask = validate(updateTaskSchema);
