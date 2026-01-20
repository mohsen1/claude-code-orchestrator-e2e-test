import * as fs from 'fs';
import * as path from 'path';
import { Note } from './types';

const NOTES_FILE = 'notes.json';

/**
 * Get the full path to notes.json
 */
function getNotesFilePath(): string {
  return path.resolve(process.cwd(), NOTES_FILE);
}

/**
 * Read notes from notes.json file
 * @returns Array of notes or empty array if file doesn't exist
 * @throws Error if file exists but cannot be parsed
 */
export function readNotes(): Note[] {
  const filePath = getNotesFilePath();

  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return [];
    }

    // Read file content
    const fileContent = fs.readFileSync(filePath, 'utf-8');

    // Return empty array if file is empty
    if (!fileContent.trim()) {
      return [];
    }

    // Parse and return notes
    const notes = JSON.parse(fileContent) as Note[];
    return notes;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Failed to parse ${NOTES_FILE}: ${error.message}`);
    }
    throw new Error(`Failed to read ${NOTES_FILE}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Write notes to notes.json file
 * @param notes - Array of notes to write
 * @throws Error if file cannot be written
 */
export function writeNotes(notes: Note[]): void {
  const filePath = getNotesFilePath();

  try {
    // Write notes to file with proper formatting
    const fileContent = JSON.stringify(notes, null, 2);
    fs.writeFileSync(filePath, fileContent, 'utf-8');
  } catch (error) {
    throw new Error(`Failed to write ${NOTES_FILE}: ${error instanceof Error ? error.message : String(error)}`);
  }
}
