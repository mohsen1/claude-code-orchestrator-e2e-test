import express, { Request, Response, NextFunction } from 'express';
import { json } from 'body-parser';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(json());

// Error handling middleware
interface ErrorResponse {
  error: string;
  message?: string;
}

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  const statusCode = (err as any).statusCode || 500;
  const response: ErrorResponse = {
    error: err.name || 'Internal Server Error',
  };

  if (process.env.NODE_ENV !== 'production') {
    response.message = err.message;
  }

  res.status(statusCode).json(response);
});

// Health check endpoint (for testing)
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
