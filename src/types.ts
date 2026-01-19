/**
 * Represents a URL entry in the system
 */
export interface UrlEntry {
  /** The original long URL */
  url: string;
  /** The generated short code (6 characters) */
  shortCode: string;
  /** Timestamp when the URL was shortened */
  createdAt: string;
  /** Number of times the short URL has been visited */
  visits: number;
}

/**
 * Request body for creating a short URL
 */
export interface CreateShortUrlRequest {
  url: string;
}

/**
 * Response body for short URL creation
 */
export interface CreateShortUrlResponse {
  shortUrl: string;
  shortCode: string;
}

/**
 * Response body for URL statistics
 */
export interface UrlStatsResponse {
  url: string;
  visits: number;
  createdAt: string;
}

/**
 * Response body for listing URLs
 */
export interface ListUrlsResponse {
  urls: UrlEntry[];
  total: number;
  page: number;
}
