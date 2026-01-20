import { Note } from './types';
import { loadNotes, saveNotes, getNextId } from './storage';

export function addNote(title: string, content: string): Note {
  const notes = loadNotes();
  const newNote: Note = {
    id: getNextId(notes),
    title,
    content,
    createdAt: new Date()
  };

  notes.push(newNote);
  saveNotes(notes);

  console.log(`✓ Note added with ID: ${newNote.id}`);
  return newNote;
}

export function listNotes(): void {
  const notes = loadNotes();

  if (notes.length === 0) {
    console.log('No notes found.');
    return;
  }

  console.log('\n📝 Your Notes:');
  console.log('═'.repeat(50));

  notes.forEach(note => {
    console.log(`\nID: ${note.id}`);
    console.log(`Title: ${note.title}`);
    console.log(`Content: ${note.content}`);
    console.log(`Created: ${note.createdAt.toLocaleString()}`);
    console.log('─'.repeat(50));
  });
}

export function deleteNote(id: number): void {
  const notes = loadNotes();
  const noteIndex = notes.findIndex(note => note.id === id);

  if (noteIndex === -1) {
    console.log(`✗ Note with ID ${id} not found.`);
    return;
  }

  notes.splice(noteIndex, 1);
  saveNotes(notes);

  console.log(`✓ Note with ID ${id} deleted successfully.`);
}

export function searchNotes(keyword: string): void {
  const notes = loadNotes();
  const lowerKeyword = keyword.toLowerCase();

  const matchedNotes = notes.filter(note =>
    note.title.toLowerCase().includes(lowerKeyword) ||
    note.content.toLowerCase().includes(lowerKeyword)
  );

  if (matchedNotes.length === 0) {
    console.log(`No notes found containing "${keyword}".`);
    return;
  }

  console.log(`\n🔍 Found ${matchedNotes.length} note(s) containing "${keyword}":`);
  console.log('═'.repeat(50));

  matchedNotes.forEach(note => {
    console.log(`\nID: ${note.id}`);
    console.log(`Title: ${note.title}`);
    console.log(`Content: ${note.content}`);
    console.log(`Created: ${note.createdAt.toLocaleString()}`);
    console.log('─'.repeat(50));
  });
}
