/**
 * Represents a shortened URL in the system
 */
export interface ShortUrl {
  /** The original URL that was shortened */
  url: string;
  /** The unique short code for this URL */
  shortCode: string;
  /** Timestamp when the URL was created (ISO 8601 format) */
  createdAt: string;
  /** Number of times this short URL has been visited */
  visits: number;
}

/**
 * Request body for creating a new short URL
 */
export interface CreateShortUrlRequest {
  /** The URL to shorten */
  url: string;
}

/**
 * Response when creating a new short URL
 */
export interface CreateShortUrlResponse {
  /** The full short URL (e.g., http://localhost:3000/abc123) */
  shortUrl: string;
  /** The short code for the URL */
  shortCode: string;
}

/**
 * Response for URL statistics
 */
export interface StatsResponse {
  /** The original URL */
  url: string;
  /** Number of visits */
  visits: number;
  /** Creation timestamp */
  createdAt: string;
}

/**
 * Single URL item in a list response
 */
export interface ShortUrlListItem {
  /** The original URL */
  url: string;
  /** The short code */
  shortCode: string;
  /** Number of visits */
  visits: number;
  /** Creation timestamp */
  createdAt: string;
}

/**
 * Response for listing all URLs with pagination
 */
export interface ListUrlsResponse {
  /** Array of shortened URLs */
  urls: ShortUrlListItem[];
  /** Total number of URLs */
  total: number;
  /** Current page number */
  page: number;
}

/**
 * API error response structure
 */
export interface ApiError {
  /** Error message describing what went wrong */
  error: string;
}
