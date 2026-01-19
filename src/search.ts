import { Note } from './types';

interface SearchResult {
  note: Note;
  score: number;
}

/**
 * Performs a case-insensitive full-text search on notes.
 * Searches through both title and content fields, then sorts results by relevance.
 * Title matches are ranked higher than content matches.
 *
 * @param notes - Array of notes to search through
 * @param query - Search query string
 * @returns Filtered and sorted array of matching notes
 */
export function searchNotes(notes: Note[], query: string): Note[] {
  // Return all notes if query is empty or whitespace only
  if (!query || query.trim() === '') {
    return notes;
  }

  const searchTerm = query.toLowerCase().trim();
  const results: SearchResult[] = [];

  for (const note of notes) {
    const titleLower = note.title.toLowerCase();
    const contentLower = note.content.toLowerCase();

    let score = 0;
    let hasMatch = false;

    // Check for matches in title (higher weight: 2 points per match)
    if (titleLower.includes(searchTerm)) {
      hasMatch = true;
      // Count occurrences in title for better relevance
      const titleMatches = (titleLower.match(new RegExp(searchTerm, 'g')) || []).length;
      score += titleMatches * 2;

      // Bonus for exact title match
      if (titleLower === searchTerm) {
        score += 5;
      }

      // Bonus for title starting with search term
      if (titleLower.startsWith(searchTerm)) {
        score += 3;
      }
    }

    // Check for matches in content (lower weight: 1 point per match)
    if (contentLower.includes(searchTerm)) {
      hasMatch = true;
      // Count occurrences in content
      const contentMatches = (contentLower.match(new RegExp(searchTerm, 'g')) || []).length;
      score += contentMatches;
    }

    // Only include notes that have at least one match
    if (hasMatch) {
      results.push({ note, score });
    }
  }

  // Sort by score (highest first) to get most relevant results
  results.sort((a, b) => b.score - a.score);

  // Return just the notes in order of relevance
  return results.map(result => result.note);
}
