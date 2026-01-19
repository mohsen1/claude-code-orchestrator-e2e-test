/**
 * URL entry data structure representing a shortened URL in storage
 */
export interface UrlEntry {
  /** The original long URL */
  url: string;

  /** The unique short code (6 characters alphanumeric) */
  shortCode: string;

  /** Timestamp when the URL was shortened */
  createdAt: Date;

  /** Number of times the short URL has been visited */
  visits: number;
}

/**
 * API response for the shorten endpoint
 * POST /api/shorten
 */
export interface ShortenApiResponse {
  /** The complete short URL (e.g., https://domain.com/abc123) */
  shortUrl: string;

  /** The short code portion only */
  shortCode: string;
}

/**
 * API response for the stats endpoint
 * GET /api/stats/:code
 */
export interface StatsApiResponse {
  /** The original long URL */
  url: string;

  /** Total number of visits */
  visits: number;

  /** ISO string of creation timestamp */
  createdAt: string;
}

/**
 * API response for the URLs list endpoint
 * GET /api/urls?page=1
 */
export interface UrlsListApiResponse {
  /** Array of URL entries for the current page */
  urls: UrlEntry[];

  /** Total number of URLs stored */
  total: number;

  /** Current page number (1-based) */
  page: number;

  /** Number of URLs per page */
  pageSize: number;
}

/**
 * Request body for the shorten endpoint
 * POST /api/shorten
 */
export interface ShortenApiRequest {
  /** The URL to shorten */
  url: string;
}
