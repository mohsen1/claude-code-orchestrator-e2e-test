export const SHORT_CODE_LENGTH = 6;

export const ALLOWED_CHARACTERS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

/**
 * Validates if a string is a properly formatted URL
 * Uses both URL constructor and regex pattern for thorough validation
 */
export function isValidUrl(url: string): boolean {
  try {
    // First, try to construct a URL object - this will catch malformed URLs
    const urlObj = new URL(url);

    // Ensure protocol is http or https
    if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
      return false;
    }

    // Additional regex validation for stricter URL format checking
    const urlPattern = /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/;
    return urlPattern.test(url);
  } catch {
    // URL constructor throws error for invalid URLs
    return false;
  }
}

/**
 * Generates a random 6-character alphanumeric short code
 * Uses Math.random for randomness
 */
export function generateShortCode(): string {
  let shortCode = '';

  for (let i = 0; i < SHORT_CODE_LENGTH; i++) {
    const randomIndex = Math.floor(Math.random() * ALLOWED_CHARACTERS.length);
    shortCode += ALLOWED_CHARACTERS[randomIndex];
  }

  return shortCode;
}
