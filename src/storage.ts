import fs from 'fs';
import path from 'path';
import { Note } from './types';

const NOTES_FILE = path.join(process.cwd(), 'notes.json');

export function loadNotes(): Note[] {
  try {
    if (!fs.existsSync(NOTES_FILE)) {
      return [];
    }
    const data = fs.readFileSync(NOTES_FILE, 'utf-8');
    return JSON.parse(data) as Note[];
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
