/**
 * Note entity representing a markdown note
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
 * Input for creating a new note
 */
export interface CreateNoteInput {
  title: string;
  content: string;
  tags?: string[];
}

/**
 * Input for updating an existing note
 * All fields are optional
 */
export interface UpdateNoteInput {
  title?: string;
  content?: string;
  tags?: string[];
}

/**
 * Tag with usage count
 */
export interface TagWithCount {
  name: string;
  count: number;
}

/**
 * Search query parameters
 */
export interface SearchQuery {
  tag?: string;
  search?: string;
}
