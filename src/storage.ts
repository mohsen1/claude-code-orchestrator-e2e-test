import { Note, CreateNoteInput, UpdateNoteInput, TagWithCount } from './types';

export class NoteStorage {
  private notes: Map<string, Note>;
  private idCounter: number;

  constructor() {
    this.notes = new Map();
    this.idCounter = 1;
  }

  /**
   * Create a new note
   */
  create(input: CreateNoteInput): Note {
    const id = this.generateId();
    const now = new Date();

    const note: Note = {
      id,
      title: input.title,
      content: input.content,
      tags: input.tags || [],
      createdAt: now,
      updatedAt: now,
    };

    this.notes.set(id, note);
    return note;
  }

  /**
   * Get all notes
   */
  getAll(): Note[] {
    return Array.from(this.notes.values());
  }

  /**
   * Get a note by ID
   */
  getById(id: string): Note | undefined {
    return this.notes.get(id);
  }

  /**
   * Update an existing note
   */
  update(id: string, input: UpdateNoteInput): Note | undefined {
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
  delete(id: string): boolean {
    return this.notes.delete(id);
  }

  /**
   * Get all unique tags with their note counts
   */
  getAllTags(): TagWithCount[] {
    const tagCounts = new Map<string, number>();

    // Count occurrences of each tag across all notes
    for (const note of this.notes.values()) {
      for (const tag of note.tags) {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      }
    }

    // Convert to array of TagWithCount objects
    return Array.from(tagCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Generate a unique ID for a new note
   */
  private generateId(): string {
    return `note-${this.idCounter++}`;
  }
}
