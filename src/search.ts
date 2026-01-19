import { Note } from './types';

/**
 * Search notes by title and content
 * Case-insensitive search with title matches prioritized
 * @param notes - Array of notes to search
 * @param query - Search query string
 * @returns Array of matching notes sorted by relevance
 */
export function searchNotes(notes: Note[], query: string): Note[] {
  if (!query || query.trim() === '') {
    return notes;
  }

  const searchTerm = query.toLowerCase().trim();
  const titleMatches: Note[] = [];
  const contentMatches: Note[] = [];

  for (const note of notes) {
    const titleLower = note.title.toLowerCase();
    const contentLower = note.content.toLowerCase();

    if (titleLower.includes(searchTerm)) {
      titleMatches.push(note);
    } else if (contentLower.includes(searchTerm)) {
      contentMatches.push(note);
    }
  }

  // Return title matches first, then content matches
  return [...titleMatches, ...contentMatches];
}
