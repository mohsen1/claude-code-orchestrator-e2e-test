// Re-export all middleware for convenient importing
export {
  validateRequest,
  createTaskSchema,
  updateTaskSchema,
  priorityEnum,
  type CreateTaskInput,
  type UpdateTaskInput
} from './validation';

export {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  AppError
} from './error';
