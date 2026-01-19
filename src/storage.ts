import { UrlEntry, PaginatedResult } from './types';

/**
 * In-memory storage for URL entries
 * Uses a Map for efficient lookups by short code
 */
class UrlStorage {
  /**
   * Private map storing URL entries keyed by short code
   * @private
   */
  private storage: Map<string, UrlEntry>;

  constructor() {
    this.storage = new Map<string, UrlEntry>();
  }

  /**
   * Store a URL entry in the storage
   * @param urlEntry - The URL entry to store
   * @returns The stored entry
   */
  set(urlEntry: UrlEntry): UrlEntry {
    this.storage.set(urlEntry.shortCode, urlEntry);
    return urlEntry;
  }

  /**
   * Retrieve a URL entry by its short code
   * @param shortCode - The short code to look up
   * @returns The URL entry if found, undefined otherwise
   */
  get(shortCode: string): UrlEntry | undefined {
    return this.storage.get(shortCode);
  }

  /**
   * Increment the visit counter for a URL entry
   * @param shortCode - The short code of the URL to update
   * @returns The updated URL entry if found, undefined otherwise
   */
  incrementVisits(shortCode: string): UrlEntry | undefined {
    const entry = this.storage.get(shortCode);
    if (!entry) {
      return undefined;
    }

    // Create a new entry with incremented visits
    const updatedEntry: UrlEntry = {
      ...entry,
      visits: entry.visits + 1,
    };

    this.storage.set(shortCode, updatedEntry);
    return updatedEntry;
  }

  /**
   * Get all URL entries as an array
   * @returns Array of all stored URL entries
   */
  getAll(): UrlEntry[] {
    return Array.from(this.storage.values());
  }

  /**
   * Check if a short code exists in storage
   * @param shortCode - The short code to check
   * @returns true if the short code exists, false otherwise
   */
  exists(shortCode: string): boolean {
    return this.storage.has(shortCode);
  }

  /**
   * Get paginated results of URL entries
   * @param page - The page number (1-indexed)
   * @param limit - The number of items per page
   * @returns Paginated result containing entries, total count, and pagination metadata
   */
  getPaginated(page: number, limit: number): PaginatedResult<UrlEntry> {
    // Convert to 0-indexed and validate
    const validatedPage = Math.max(1, page);
    const validatedLimit = Math.max(1, limit);

    // Get all entries and sort by creation date (newest first)
    const allEntries = this.getAll().sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const total = allEntries.length;
    const totalPages = Math.ceil(total / validatedLimit);

    // Calculate start and end indices for pagination
    const startIndex = (validatedPage - 1) * validatedLimit;
    const endIndex = Math.min(startIndex + validatedLimit, total);

    // Extract the page slice
    const items = allEntries.slice(startIndex, endIndex);

    return {
      items,
      total,
      page: validatedPage,
      limit: validatedLimit,
      totalPages,
    };
  }

  /**
   * Clear all entries from storage (useful for testing)
   */
  clear(): void {
    this.storage.clear();
  }

  /**
   * Get the total number of stored entries
   * @returns The count of entries in storage
   */
  count(): number {
    return this.storage.size;
  }
}

/**
 * Singleton instance of UrlStorage
 */
export const urlStorage = new UrlStorage();

// Export the class as well for testing purposes
export default UrlStorage;
