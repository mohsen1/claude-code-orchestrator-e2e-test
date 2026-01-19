/**
 * Validates if a string is a properly formatted URL with http or https protocol
 * @param url - The URL string to validate
 * @returns true if valid, false otherwise
 */
export function isValidUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    // Check if protocol is http or https
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
  } catch {
    // URL constructor throws error for invalid URLs
    return false;
  }
}

/**
 * Generates a random 6-character alphanumeric string
 * Characters: a-z, A-Z, 0-9 (62 possible characters)
 * @returns A random 6-character short code
 */
export function generateShortCode(): string {
  const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const codeLength = 6;
  let result = '';

  for (let i = 0; i < codeLength; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }

  return result;
}

/**
 * Generates a unique short code that doesn't collide with existing codes
 * @param existingCodes - Set of already used short codes
 * @returns A unique 6-character short code not in existingCodes
 */
export function generateUniqueShortCode(existingCodes: Set<string>): string {
  let shortCode: string;
  let attempts = 0;
  const maxAttempts = 100; // Prevent infinite loop in extremely rare cases

  do {
    shortCode = generateShortCode();
    attempts++;

    if (attempts > maxAttempts) {
      throw new Error('Failed to generate unique short code after maximum attempts');
    }
  } while (existingCodes.has(shortCode));

  return shortCode;
}
