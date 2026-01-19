/**
 * Represents a note with all its properties
 */
export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Data Transfer Object for creating a new note
 */
export interface CreateNoteDTO {
  title: string;
  content: string;
  tags?: string[];
}

/**
 * Data Transfer Object for updating an existing note
 * All fields are optional
 */
export interface UpdateNoteDTO {
  title?: string;
  content?: string;
  tags?: string[];
}

/**
 * Summary of a tag with its usage count
 */
export interface TagSummary {
  name: string;
  count: number;
}

/**
 * Query parameters for searching notes
 */
export interface SearchQuery {
  tag?: string;
  search?: string;
}

/**
 * Note response with rendered HTML
 */
export interface NoteWithHtml extends Note {
  html: string;
}

/**
 * Response for list notes endpoint
 */
export interface NotesListResponse {
  notes: Note[];
}

/**
 * Response for tags list endpoint
 */
export interface TagsListResponse {
  tags: TagSummary[];
}
