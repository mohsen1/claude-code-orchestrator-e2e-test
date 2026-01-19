import { Note, CreateNoteInput, UpdateNoteInput, Tag } from './types';

export class Storage {
  private notes: Map<string, Note>;
  private idCounter: number;

  constructor() {
    this.notes = new Map();
    this.idCounter = 1;
  }

  createNote(input: CreateNoteInput): Note {
    const id = this.idCounter.toString();
    this.idCounter++;

    const note: Note = {
      id,
      title: input.title,
      content: input.content,
      tags: input.tags || [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.notes.set(id, note);
    return note;
  }

  getNote(id: string): Note | undefined {
    return this.notes.get(id);
  }

  getAllNotes(): Note[] {
    return Array.from(this.notes.values());
  }

  updateNote(id: string, input: UpdateNoteInput): Note | undefined {
    const note = this.notes.get(id);
    if (!note) {
      return undefined;
    }

    const updatedNote: Note = {
      ...note,
      title: input.title !== undefined ? input.title : note.title,
      content: input.content !== undefined ? input.content : note.content,
      tags: input.tags !== undefined ? input.tags : note.tags,
      updatedAt: new Date()
    };

    this.notes.set(id, updatedNote);
    return updatedNote;
  }

  deleteNote(id: string): boolean {
    return this.notes.delete(id);
  }

  getNotesByTag(tag: string): Note[] {
    return this.getAllNotes().filter(note =>
      note.tags.includes(tag)
    );
  }

  getAllTags(): Tag[] {
    const tagMap = new Map<string, number>();

    for (const note of this.notes.values()) {
      for (const tag of note.tags) {
        tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
      }
    }

    return Array.from(tagMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }
}
