import * as fs from 'fs';
import * as path from 'path';
import { Note } from './types';

const NOTES_FILE = path.join(process.cwd(), 'notes.json');

export function loadNotes(): Note[] {
  if (!fs.existsSync(NOTES_FILE)) {
    return [];
  }

  try {
    const data = fs.readFileSync(NOTES_FILE, 'utf-8');
    const notes = JSON.parse(data);
    return notes.map((note: any) => ({
      ...note,
      createdAt: new Date(note.createdAt)
    }));
  } catch (error) {
    console.error('Error loading notes:', error);
    return [];
  }
}

export function saveNotes(notes: Note[]): void {
  try {
    fs.writeFileSync(NOTES_FILE, JSON.stringify(notes, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving notes:', error);
    throw error;
  }
}

export function getNextId(notes: Note[]): number {
  if (notes.length === 0) {
    return 1;
  }
  return Math.max(...notes.map(note => note.id)) + 1;
}
