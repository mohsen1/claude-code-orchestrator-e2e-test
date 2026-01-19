import { UrlEntry } from './types';

/**
 * In-memory storage layer using Map data structure
 * Stores URL entries with short codes as keys
 */
class Storage {
  private urls: Map<string, UrlEntry>;

  constructor() {
    this.urls = new Map<string, UrlEntry>();
  }

  /**
   * Creates a new short URL entry
   * @param url - The original URL to shorten
   * @param shortCode - The generated short code
   * @returns The short code
   */
  createShortCode(url: string, shortCode: string): string {
    const entry: UrlEntry = {
      url,
      shortCode,
      createdAt: new Date(),
      visits: 0
    };

    this.urls.set(shortCode, entry);
    return shortCode;
  }

  /**
   * Retrieves a URL entry by short code
   * @param shortCode - The short code to look up
   * @returns The URL entry or undefined if not found
   */
  getShortCode(shortCode: string): UrlEntry | undefined {
    return this.urls.get(shortCode);
  }

  /**
   * Increments the visit count for a short code
   * @param shortCode - The short code to increment visits for
   * @returns The updated entry or undefined if not found
   */
  incrementVisits(shortCode: string): UrlEntry | undefined {
    const entry = this.urls.get(shortCode);

    if (!entry) {
      return undefined;
    }

    entry.visits += 1;
    this.urls.set(shortCode, entry);

    return entry;
  }

  /**
   * Returns all URL entries
   * @returns Array of all URL entries
   */
  getAllUrls(): UrlEntry[] {
    return Array.from(this.urls.values());
  }

  /**
   * Checks if a short code already exists
   * @param shortCode - The short code to check
   * @returns True if the short code exists, false otherwise
   */
  exists(shortCode: string): boolean {
    return this.urls.has(shortCode);
  }

  /**
   * Returns the total number of stored URLs
   * @returns The count of stored URLs
   */
  count(): number {
    return this.urls.size;
  }
}

// Export a singleton instance
export const storage = new Storage();
