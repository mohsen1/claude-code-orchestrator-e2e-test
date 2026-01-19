import express, { Application } from 'express';
import cors from 'cors';
import { NoteStorage } from './storage';
import { createRoutes } from './routes';

// Initialize storage
const storage = new NoteStorage();

// Create Express app
const app: Application = express();

// Configure JSON body parser
app.use(express.json());

// Configure CORS
app.use(cors());

// Mount API routes
app.use('/api', createRoutes(storage));

// Get PORT from environment variable or use default
const PORT = process.env.PORT || 3000;

// Start server
app.listen(PORT, () => {
  console.log(`Markdown Notes API server is running on port ${PORT}`);
  console.log(`API endpoints available at http://localhost:${PORT}/api`);
});
