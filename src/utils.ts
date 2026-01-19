/**
 * Character set for generating short codes
 * Alphanumeric: a-z, A-Z, 0-9 (62 characters)
 */
const CHAR_SET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

/**
 * Length of generated short codes
 */
const SHORT_CODE_LENGTH = 6;

/**
 * Generates a random short code for URL shortening
 * @returns A 6-character alphanumeric string
 */
export function generateShortCode(): string {
  let shortCode = '';

  for (let i = 0; i < SHORT_CODE_LENGTH; i++) {
    const randomIndex = Math.floor(Math.random() * CHAR_SET.length);
    shortCode += CHAR_SET[randomIndex];
  }

  return shortCode;
}

/**
 * Validates if a string is a properly formatted URL
 * @param urlString - The string to validate
 * @returns True if the string is a valid URL, false otherwise
 */
export function isValidUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);

    // Ensure the URL has a valid protocol (http, https, or ftp)
    const validProtocols = ['http:', 'https:', 'ftp:'];
    if (!validProtocols.includes(url.protocol)) {
      return false;
    }

    // Ensure there's a hostname
    if (!url.hostname || url.hostname.length === 0) {
      return false;
    }

    return true;
  } catch (error) {
    // URL constructor throws TypeError for invalid URLs
    return false;
  }
}

/**
 * Constructs the full short URL from a short code
 * @param shortCode - The short code
 * @param baseUrl - The base URL of the server (optional, defaults to localhost)
 * @returns The complete short URL
 */
export function buildShortUrl(shortCode: string, baseUrl: string = 'http://localhost:3000'): string {
  return `${baseUrl}/${shortCode}`;
}
