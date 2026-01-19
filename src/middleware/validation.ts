import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

// Zod schema for priority enum
const PrioritySchema = z.enum(['low', 'medium', 'high'], {
  errorMap: () => ({ message: 'Priority must be one of: low, medium, high' }),
});

// Zod schema for creating a task
export const createTaskSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must not exceed 200 characters'),
  description: z.string()
    .max(1000, 'Description must not exceed 1000 characters')
    .optional(),
  due_date: z.string()
    .datetime('Due date must be a valid ISO 8601 datetime string')
    .optional(),
  priority: PrioritySchema.optional().default('medium'),
});

// Zod schema for updating a task (all fields optional)
export const updateTaskSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must not exceed 200 characters')
    .optional(),
  description: z.string()
    .max(1000, 'Description must not exceed 1000 characters')
    .optional()
    .nullable(),
  due_date: z.string()
    .datetime('Due date must be a valid ISO 8601 datetime string')
    .optional()
    .nullable(),
  priority: PrioritySchema.optional(),
  archived: z.boolean().optional(),
});

// Type inference from schemas
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

/**
 * Factory function to create validation middleware
 * @param schema - Zod schema to validate against
 * @returns Express middleware function
 */
export function validateBody<T extends z.ZodType>(schema: T) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Validate request body against the schema
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Format Zod validation errors into a readable structure
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        res.status(400).json({
          error: 'Validation failed',
          details: formattedErrors,
        });
      } else {
        // Handle non-Zod errors
        res.status(400).json({
          error: 'Invalid request format',
        });
      }
    }
  };
}

// Pre-configured middleware for common operations
export const validateCreateTask = validateBody(createTaskSchema);
export const validateUpdateTask = validateBody(updateTaskSchema);
