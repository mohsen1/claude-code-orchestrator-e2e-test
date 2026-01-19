import { Note } from './types';

export function searchNotes(notes: Note[], query: string): Note[] {
  if (!query) {
    return notes;
  }

  const lowerQuery = query.toLowerCase();

  return notes
    .map(note => ({
      note,
      titleMatch: note.title.toLowerCase().includes(lowerQuery),
      contentMatch: note.content.toLowerCase().includes(lowerQuery)
    }))
    .filter(({ titleMatch, contentMatch }) => titleMatch || contentMatch)
    .sort((a, b) => {
      // Title matches come first
      if (a.titleMatch && !b.titleMatch) return -1;
      if (!a.titleMatch && b.titleMatch) return 1;
      return 0;
    })
    .map(({ note }) => note);
}
