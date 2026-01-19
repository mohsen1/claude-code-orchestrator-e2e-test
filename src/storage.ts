export interface ShortUrl {
  url: string;
  shortCode: string;
  createdAt: Date;
  visits: number;
}

export class UrlStorage {
  private storage: Map<string, ShortUrl> = new Map();

  /**
   * Save a URL with its short code
   * @param url - The original URL to shorten
   * @param shortCode - The generated short code
   * @returns The created ShortUrl object
   */
  save(url: string, shortCode: string): ShortUrl {
    const shortUrl: ShortUrl = {
      url,
      shortCode,
      createdAt: new Date(),
      visits: 0,
    };

    this.storage.set(shortCode, shortUrl);
    return shortUrl;
  }

  /**
   * Find a URL by its short code
   * @param code - The short code to lookup
   * @returns The ShortUrl object or undefined if not found
   */
  findByCode(code: string): ShortUrl | undefined {
    return this.storage.get(code);
  }

  /**
   * Increment the visit count for a short code
   * @param code - The short code to increment visits for
   * @returns True if successful, false if code not found
   */
  incrementVisits(code: string): boolean {
    const shortUrl = this.storage.get(code);
    if (!shortUrl) {
      return false;
    }

    shortUrl.visits += 1;
    this.storage.set(code, shortUrl);
    return true;
  }

  /**
   * Get all stored URLs
   * @returns Array of all ShortUrl objects
   */
  listAll(): ShortUrl[] {
    return Array.from(this.storage.values());
  }

  /**
   * Get the total count of stored URLs
   * @returns The number of URLs in storage
   */
  count(): number {
    return this.storage.size;
  }
}
