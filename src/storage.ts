import { UrlEntry } from './types';

/**
 * In-memory storage for URL entries
 * Using a Map for O(1) lookups by short code
 */
export class UrlStorage {
  private urls: Map<string, UrlEntry> = new Map();

  /**
   * Store a new URL entry
   */
  save(entry: UrlEntry): void {
    this.urls.set(entry.shortCode, entry);
  }

  /**
   * Retrieve a URL entry by short code
   */
  findByShortCode(shortCode: string): UrlEntry | undefined {
    return this.urls.get(shortCode);
  }

  /**
   * Check if a short code already exists
   */
  exists(shortCode: string): boolean {
    return this.urls.has(shortCode);
  }

  /**
   * Increment visit count for a URL entry
   */
  incrementVisits(shortCode: string): boolean {
    const entry = this.urls.get(shortCode);
    if (entry) {
      entry.visits += 1;
      this.urls.set(shortCode, entry);
      return true;
    }
    return false;
  }

  /**
   * Get all URLs with pagination
   */
  getAll(page: number, pageSize: number = 10): { urls: UrlEntry[]; total: number } {
    const allUrls = Array.from(this.urls.values());
    const total = allUrls.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedUrls = allUrls.slice(start, end);

    return {
      urls: paginatedUrls,
      total
    };
  }

  /**
   * Get total count of URLs
   */
  count(): number {
    return this.urls.size;
  }
}

// Export singleton instance
export const storage = new UrlStorage();
