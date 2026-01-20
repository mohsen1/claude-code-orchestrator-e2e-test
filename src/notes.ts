import { Note } from './types';
import { loadNotes, saveNotes } from './storage';

export function addNote(title: string, content: string): Note {
  const notes = loadNotes();

  const newNote: Note = {
    id: notes.length > 0 ? Math.max(...notes.map(n => n.id)) + 1 : 1,
    title,
    content,
    createdAt: new Date(),
  };

  notes.push(newNote);
  saveNotes(notes);

  return newNote;
}

export function listNotes(): Note[] {
  return loadNotes();
}

export function deleteNote(id: number): boolean {
  const notes = loadNotes();
  const initialLength = notes.length;

  const filteredNotes = notes.filter(note => note.id !== id);

  if (filteredNotes.length === initialLength) {
    return false;
  }

  saveNotes(filteredNotes);
  return true;
}

export function searchNotes(keyword: string): Note[] {
  const notes = loadNotes();
  const lowerKeyword = keyword.toLowerCase();

  return notes.filter(note =>
    note.title.toLowerCase().includes(lowerKeyword) ||
    note.content.toLowerCase().includes(lowerKeyword)
  );
}
