import { v4 as uuidv4 } from 'uuid';
import { Note, NoteData, NoteUpdates } from './types';

export class NoteStorage {
  private notes: Map<string, Note>;

  constructor() {
    this.notes = new Map<string, Note>();
  }

  /**
   * Create a new note with generated UUID
   * @param noteData - The note data (title, content, optional tags)
   * @returns The created Note with generated id and timestamps
   */
  create(noteData: NoteData): Note {
    const id = uuidv4();
    const now = new Date();

    const note: Note = {
      id,
      title: noteData.title,
      content: noteData.content,
      tags: noteData.tags || [],
      createdAt: now,
      updatedAt: now,
    };

    this.notes.set(id, note);
    return note;
  }

  /**
   * Get all notes
   * @returns Array of all notes
   */
  findAll(): Note[] {
    return Array.from(this.notes.values());
  }

  /**
   * Find a note by ID
   * @param id - The note ID
   * @returns The note if found, undefined otherwise
   */
  findById(id: string): Note | undefined {
    return this.notes.get(id);
  }

  /**
   * Update an existing note
   * @param id - The note ID
   * @param updates - The fields to update
   * @returns The updated note
   * @throws Error if note not found
   */
  update(id: string, updates: NoteUpdates): Note {
    const note = this.notes.get(id);

    if (!note) {
      throw new Error(`Note with id ${id} not found`);
    }

    // Update only provided fields
    if (updates.title !== undefined) {
      note.title = updates.title;
    }

    if (updates.content !== undefined) {
      note.content = updates.content;
    }

    if (updates.tags !== undefined) {
      note.tags = updates.tags;
    }

    // Update the timestamp
    note.updatedAt = new Date();

    // Update the map with the modified note
    this.notes.set(id, note);

    return note;
  }

  /**
   * Delete a note by ID
   * @param id - The note ID
   * @returns true if deleted, false if not found
   */
  delete(id: string): boolean {
    return this.notes.delete(id);
  }

  /**
   * Find notes by tag
   * @param tag - The tag to filter by
   * @returns Array of notes with the specified tag
   */
  findByTag(tag: string): Note[] {
    return this.findAll().filter((note) => note.tags.includes(tag));
  }

  /**
   * Get all unique tags with note counts
   * @returns Array of tag names and their counts
   */
  getAllTags(): { name: string; count: number }[] {
    const tagCounts = new Map<string, number>();

    for (const note of this.notes.values()) {
      for (const tag of note.tags) {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      }
    }

    return Array.from(tagCounts.entries()).map(([name, count]) => ({
      name,
      count,
    }));
  }
}
