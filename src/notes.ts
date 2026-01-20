import { Note } from './types';
import { readNotes, writeNotes } from './storage';

let nextId = 1;

async function initializeNextId(): Promise<void> {
  const notes = await readNotes();
  if (notes.length > 0) {
    const maxId = Math.max(...notes.map(note => note.id));
    nextId = maxId + 1;
  }
}

initializeNextId().catch(() => {});

export async function addNote(title: string, content: string): Promise<Note> {
  const notes = await readNotes();

  const newNote: Note = {
    id: nextId++,
    title,
    content,
    createdAt: new Date().toISOString()
  };

  notes.push(newNote);
  await writeNotes(notes);

  return newNote;
}

export async function listNotes(): Promise<Note[]> {
  return await readNotes();
}

export async function deleteNote(id: number): Promise<boolean> {
  const notes = await readNotes();
  const initialLength = notes.length;

  const filteredNotes = notes.filter(note => note.id !== id);

  if (filteredNotes.length < initialLength) {
    await writeNotes(filteredNotes);
    return true;
  }

  return false;
}

export async function searchNotes(keyword: string): Promise<Note[]> {
  const notes = await readNotes();
  const lowerKeyword = keyword.toLowerCase();

  return notes.filter(note =>
    note.title.toLowerCase().includes(lowerKeyword) ||
    note.content.toLowerCase().includes(lowerKeyword)
  );
}
