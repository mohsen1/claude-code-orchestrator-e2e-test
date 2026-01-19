import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export function validateRequestBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        res.status(400).json({
          error: 'Validation failed',
          details: errors
        });
      } else {
        res.status(400).json({
          error: 'Invalid request body'
        });
      }
    }
  };
}

export function validateRequestQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        res.status(400).json({
          error: 'Validation failed',
          details: errors
        });
      } else {
        res.status(400).json({
          error: 'Invalid request query parameters'
        });
      }
    }
  };
}

export function validateRequestParams(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.params = schema.parse(req.params);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        res.status(400).json({
          error: 'Validation failed',
          details: errors
        });
      } else {
        res.status(400).json({
          error: 'Invalid request parameters'
        });
      }
    }
  };
}
