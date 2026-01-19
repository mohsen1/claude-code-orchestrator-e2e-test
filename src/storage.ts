import { Note, CreateNoteInput, UpdateNoteInput, TagWithCount } from './types';

/**
 * In-memory storage layer for notes
 */
export class NoteStorage {
  private notes: Map<string, Note>;

  constructor() {
    this.notes = new Map();
  }

  /**
   * Generate a unique ID for a new note
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  /**
   * Create a new note
   */
  createNote(input: CreateNoteInput): Note {
    const now = new Date();
    const note: Note = {
      id: this.generateId(),
      title: input.title,
      content: input.content,
      tags: input.tags || [],
      createdAt: now,
      updatedAt: now,
    };
    this.notes.set(note.id, note);
    return note;
  }

  /**
   * Get a note by ID
   */
  getNote(id: string): Note | undefined {
    return this.notes.get(id);
  }

  /**
   * Get all notes
   */
  getAllNotes(): Note[] {
    return Array.from(this.notes.values());
  }

  /**
   * Update a note by ID
   */
  updateNote(id: string, input: UpdateNoteInput): Note | undefined {
    const existingNote = this.notes.get(id);
    if (!existingNote) {
      return undefined;
    }

    const updatedNote: Note = {
      ...existingNote,
      title: input.title !== undefined ? input.title : existingNote.title,
      content: input.content !== undefined ? input.content : existingNote.content,
      tags: input.tags !== undefined ? input.tags : existingNote.tags,
      updatedAt: new Date(),
    };

    this.notes.set(id, updatedNote);
    return updatedNote;
  }

  /**
   * Delete a note by ID
   */
  deleteNote(id: string): boolean {
    return this.notes.delete(id);
  }

  /**
   * Get notes filtered by tag
   */
  getNotesByTag(tag: string): Note[] {
    return this.getAllNotes().filter((note) =>
      note.tags.includes(tag)
    );
  }

  /**
   * Get all unique tags with note counts
   */
  getAllTags(): TagWithCount[] {
    const tagCounts = new Map<string, number>();

    for (const note of this.notes.values()) {
      for (const tag of note.tags) {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      }
    }

    return Array.from(tagCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }
}
