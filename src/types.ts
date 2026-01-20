/**
 * Core type definitions for the CLI notes application
 */

/**
 * Represents a single note with its properties
 */
export interface Note {
  /** Unique identifier for the note */
  id: string;
  /** Title of the note */
  title: string;
  /** Content/body of the note */
  content: string;
  /** Timestamp when the note was created (ISO 8601 format) */
  createdAt: string;
  /** Timestamp when the note was last updated (ISO 8601 format) */
  updatedAt: string;
}

/**
 * Storage structure for notes persisted in JSON format
 */
export interface NotesStorage {
  /** Array of notes stored in the system */
  notes: Note[];
}

/**
 * Options for searching/filtering notes
 */
export interface SearchOptions {
  /** Search query string to match against title or content */
  query?: string;
  /** Maximum number of results to return */
  limit?: number;
}
