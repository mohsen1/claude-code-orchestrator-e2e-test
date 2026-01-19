import { Router, Request, Response } from 'express';
import { NoteStorage } from './storage';
import { renderMarkdown } from './markdown';
import { searchNotes } from './search';
import { CreateNoteInput, UpdateNoteInput, NoteWithHtml } from './types';

export function createRoutes(storage: NoteStorage): Router {
  const router = Router();

  /**
   * POST /api/notes
   * Create a new note
   */
  router.post('/notes', (req: Request, res: Response) => {
    try {
      const { title, content, tags } = req.body;

      // Validate required fields
      if (!title || typeof title !== 'string') {
        return res.status(400).json({ error: 'Title is required and must be a string' });
      }
      if (!content || typeof content !== 'string') {
        return res.status(400).json({ error: 'Content is required and must be a string' });
      }
      if (tags !== undefined && !Array.isArray(tags)) {
        return res.status(400).json({ error: 'Tags must be an array of strings' });
      }

      const input: CreateNoteInput = { title, content, tags };
      const note = storage.createNote(input);

      return res.status(201).json(note);
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  /**
   * GET /api/notes
   * List all notes with optional tag filter and search
   */
  router.get('/notes', (req: Request, res: Response) => {
    try {
      const { tag, search } = req.query;

      let notes = storage.getAllNotes();

      // Filter by tag if provided
      if (tag && typeof tag === 'string') {
        notes = notes.filter((note) => note.tags.includes(tag));
      }

      // Search if query provided
      if (search && typeof search === 'string') {
        notes = searchNotes(notes, search);
      }

      return res.status(200).json({ notes });
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  /**
   * GET /api/notes/:id
   * Get a single note with rendered HTML
   */
  router.get('/notes/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const note = storage.getNote(id);

      if (!note) {
        return res.status(404).json({ error: 'Note not found' });
      }

      const noteWithHtml: NoteWithHtml = {
        ...note,
        html: renderMarkdown(note.content),
      };

      return res.status(200).json(noteWithHtml);
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  /**
   * PUT /api/notes/:id
   * Update a note
   */
  router.put('/notes/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { title, content, tags } = req.body;

      // Validate that at least one field is provided
      if (title === undefined && content === undefined && tags === undefined) {
        return res.status(400).json({ error: 'At least one field (title, content, or tags) must be provided' });
      }

      // Validate types if provided
      if (title !== undefined && typeof title !== 'string') {
        return res.status(400).json({ error: 'Title must be a string' });
      }
      if (content !== undefined && typeof content !== 'string') {
        return res.status(400).json({ error: 'Content must be a string' });
      }
      if (tags !== undefined && !Array.isArray(tags)) {
        return res.status(400).json({ error: 'Tags must be an array of strings' });
      }

      const input: UpdateNoteInput = { title, content, tags };
      const updatedNote = storage.updateNote(id, input);

      if (!updatedNote) {
        return res.status(404).json({ error: 'Note not found' });
      }

      return res.status(200).json(updatedNote);
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  /**
   * DELETE /api/notes/:id
   * Delete a note
   */
  router.delete('/notes/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const deleted = storage.deleteNote(id);

      if (!deleted) {
        return res.status(404).json({ error: 'Note not found' });
      }

      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  /**
   * GET /api/tags
   * Get all unique tags with note counts
   */
  router.get('/tags', (req: Request, res: Response) => {
    try {
      const tags = storage.getAllTags();
      return res.status(200).json({ tags });
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
}
