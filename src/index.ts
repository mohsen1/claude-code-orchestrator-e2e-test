import express, { Application, Request, Response, NextFunction } from 'express';
import { notesRouter, tagsRouter } from './routes';

const app: Application = express();
const PORT = process.env.PORT || 3000;

// JSON middleware
app.use(express.json());

// Routes
app.use('/api/notes', notesRouter);
app.use('/api/tags', tagsRouter);

// Error handler middleware
interface ErrorResponse {
  message: string;
  error?: string;
}

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  const errorResponse: ErrorResponse = {
    message: err.message || 'Internal Server Error',
  };

  if (process.env.NODE_ENV !== 'test') {
    errorResponse.error = err.stack;
  }

  res.status(statusCode).json(errorResponse);
});

// 404 handler for undefined routes
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server only if not in test mode
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;
