import { Router, Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { marked } from 'marked';

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface TagStats {
  name: string;
  count: number;
}

// In-memory storage
const notesStore = new Map<string, Note>();

// Extend Request interface for query params
interface NotesQuery {
  tag?: string;
  search?: string;
}

const router = Router();

// Helper function to search notes
function searchNotes(query: string): Note[] {
  const lowerQuery = query.toLowerCase();
  return Array.from(notesStore.values())
    .filter(note =>
      note.title.toLowerCase().includes(lowerQuery) ||
      note.content.toLowerCase().includes(lowerQuery)
    )
    .sort((a, b) => {
      // Sort by title matches first
      const aTitleMatch = a.title.toLowerCase().includes(lowerQuery);
      const bTitleMatch = b.title.toLowerCase().includes(lowerQuery);

      if (aTitleMatch && !bTitleMatch) return -1;
      if (!aTitleMatch && bTitleMatch) return 1;

      return 0;
    });
}

// Helper function to get tag statistics
function getTagStats(): TagStats[] {
  const tagMap = new Map<string, number>();

  for (const note of notesStore.values()) {
    for (const tag of note.tags) {
      tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
    }
  }

  return Array.from(tagMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

// POST /api/notes - Create a new note
router.post('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, content, tags = [] } = req.body;

    // Validation
    if (!title || typeof title !== 'string') {
      return res.status(400).json({ message: 'Title is required and must be a string' });
    }

    if (!content || typeof content !== 'string') {
      return res.status(400).json({ message: 'Content is required and must be a string' });
    }

    if (!Array.isArray(tags)) {
      return res.status(400).json({ message: 'Tags must be an array' });
    }

    // Validate all tags are strings
    if (tags.some(tag => typeof tag !== 'string')) {
      return res.status(400).json({ message: 'All tags must be strings' });
    }

    const now = new Date();
    const note: Note = {
      id: uuidv4(),
      title: title.trim(),
      content: content.trim(),
      tags: tags.map(tag => tag.trim()),
      createdAt: now,
      updatedAt: now,
    };

    notesStore.set(note.id, note);

    res.status(201).json(note);
  } catch (error) {
    next(error);
  }
});

// GET /api/notes - List all notes with optional filtering
router.get('/', (req: Request<{}, {}, {}, NotesQuery>, res: Response, next: NextFunction) => {
  try {
    const { tag, search } = req.query;

    let notes = Array.from(notesStore.values());

    // Filter by tag if provided
    if (tag) {
      notes = notes.filter(note =>
        note.tags.includes(tag)
      );
    }

    // Search if query provided
    if (search) {
      notes = searchNotes(search);
    }

    // Sort by updatedAt descending (most recent first)
    notes = notes.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

    res.status(200).json({ notes });
  } catch (error) {
    next(error);
  }
});

// GET /api/notes/:id - Get a single note with HTML rendering
router.get('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const note = notesStore.get(id);

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Convert markdown to HTML
    const html = marked(note.content);

    res.status(200).json({
      ...note,
      html,
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/notes/:id - Update a note
router.put('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { title, content, tags } = req.body;

    const existingNote = notesStore.get(id);

    if (!existingNote) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Validate if provided
    if (title !== undefined) {
      if (typeof title !== 'string') {
        return res.status(400).json({ message: 'Title must be a string' });
      }
    }

    if (content !== undefined) {
      if (typeof content !== 'string') {
        return res.status(400).json({ message: 'Content must be a string' });
      }
    }

    if (tags !== undefined) {
      if (!Array.isArray(tags)) {
        return res.status(400).json({ message: 'Tags must be an array' });
      }
      if (tags.some(tag => typeof tag !== 'string')) {
        return res.status(400).json({ message: 'All tags must be strings' });
      }
    }

    // Update note with provided fields
    const updatedNote: Note = {
      ...existingNote,
      title: title !== undefined ? title.trim() : existingNote.title,
      content: content !== undefined ? content.trim() : existingNote.content,
      tags: tags !== undefined ? tags.map(tag => tag.trim()) : existingNote.tags,
      updatedAt: new Date(),
    };

    notesStore.set(id, updatedNote);

    res.status(200).json(updatedNote);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/notes/:id - Delete a note
router.delete('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const exists = notesStore.has(id);

    if (!exists) {
      return res.status(404).json({ message: 'Note not found' });
    }

    notesStore.delete(id);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export const notesRouter = router;

// Tags router
const tagsRouter = Router();

// GET /api/tags - Get all tags with counts
tagsRouter.get('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const tags = getTagStats();
    res.status(200).json({ tags });
  } catch (error) {
    next(error);
  }
});

export { tagsRouter };
