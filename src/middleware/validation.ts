import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

// Enum for priority levels
export const priorityEnum = z.enum(['low', 'medium', 'high'], {
  errorMap: () => ({ message: 'Priority must be one of: low, medium, high' })
});

// Schema for creating a task
export const createTaskSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must not exceed 200 characters')
    .trim(),
  description: z.string()
    .max(1000, 'Description must not exceed 1000 characters')
    .trim()
    .optional(),
  due_date: z.string()
    .datetime('Due date must be a valid ISO date string')
    .optional(),
  priority: priorityEnum.optional()
});

// Schema for updating a task - all fields are optional
export const updateTaskSchema = createTaskSchema.partial();

// Type exports
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

/**
 * Middleware factory to validate request body against a Zod schema
 * @param schema - Zod schema to validate against
 * @returns Express middleware function
 */
export const validateRequest = <T extends z.ZodType>(schema: T) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Validate the request body against the schema
      const validatedData = schema.parse(req.body);

      // Attach validated data to the request for use in route handlers
      req.body = validatedData;

      next();
    } catch (error) {
      // Handle Zod validation errors
      if (error instanceof z.ZodError) {
        // Format error messages to be user-friendly
        const errorMessages = error.errors.map(err =>
          `${err.path.join('.')}: ${err.message}`
        ).join(', ');

        res.status(400).json({
          error: errorMessages
        });
        return;
      }

      // Handle other unexpected errors
      res.status(400).json({
        error: 'Invalid request data'
      });
      return;
    }
  };
};
