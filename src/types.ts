/**
 * Represents a single note in the application
 */
export interface Note {
  /** Unique identifier for the note */
  id: string;
  /** Title of the note */
  title: string;
  /** Content/body of the note */
  content: string;
  /** Timestamp when the note was created (ISO 8601 format) */
  timestamp: string;
}

/**
 * Interface for notes storage operations
 * Defines the contract for managing notes persistence
 */
export interface NotesStorage {
  /**
   * Load all notes from storage
   * @returns Promise resolving to an array of notes
   */
  load(): Promise<Note[]>;

  /**
   * Save notes to storage
   * @param notes - Array of notes to persist
   * @returns Promise that resolves when save is complete
   */
  save(notes: Note[]): Promise<void>;

  /**
   * Add a new note
   * @param title - Title of the note
   * @param content - Content of the note
   * @returns Promise resolving to the created note
   */
  add(title: string, content: string): Promise<Note>;

  /**
   * Delete a note by its ID
   * @param id - Unique identifier of the note to delete
   * @returns Promise that resolves to true if deleted, false if not found
   */
  delete(id: string): Promise<boolean>;

  /**
   * Search notes by title or content
   * @param query - Search query string
   * @returns Promise resolving to array of matching notes
   */
  search(query: string): Promise<Note[]>;

  /**
   * Get all notes
   * @returns Promise resolving to array of all notes
   */
  getAll(): Promise<Note[]>;
}
