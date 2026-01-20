import * as fs from 'fs/promises';
import * as path from 'path';
import { Note } from './types';

const NOTES_FILE = path.join(process.cwd(), 'notes.json');

export async function readNotes(): Promise<Note[]> {
  try {
    const data = await fs.readFile(NOTES_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

export async function writeNotes(notes: Note[]): Promise<void> {
  await fs.writeFile(NOTES_FILE, JSON.stringify(notes, null, 2), 'utf-8');
}
