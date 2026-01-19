/**
 * Represents a URL entry in storage
 */
export interface UrlEntry {
  /** The original long URL */
  url: string;
  /** The short code for the URL */
  shortCode: string;
  /** Timestamp when the URL was created */
  createdAt: string;
  /** Number of times the URL has been visited */
  visits: number;
}

/**
 * Paginated result structure
 */
export interface PaginatedResult<T> {
  /** Array of items for the current page */
  items: T[];
  /** Total number of items across all pages */
  total: number;
  /** Current page number */
  page: number;
  /** Number of items per page */
  limit: number;
  /** Total number of pages */
  totalPages: number;
}
