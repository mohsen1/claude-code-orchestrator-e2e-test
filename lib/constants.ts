/**
 * Application-wide constants
 */

export const APP_NAME = "SplitSync";
export const APP_VERSION = "1.0.0";
export const APP_DESCRIPTION = "Real-time expense sharing application";

/**
 * Pagination defaults
 */
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

/**
 * Rate limiting configuration
 */
export const RATE_LIMIT = {
  MAX_REQUESTS: 100,
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
} as const;

/**
 * File upload limits
 */
export const FILE_UPLOAD = {
  MAX_SIZE_MB: 5,
  MAX_SIZE_BYTES: 5 * 1024 * 1024,
  ALLOWED_TYPES: ["image/jpeg", "image/png", "image/webp", "application/pdf"],
} as const;

/**
 * Invite link defaults
 */
export const INVITE_LINK = {
  DEFAULT_EXPIRY_HOURS: 168, // 7 days
  MAX_EXPIRY_HOURS: 8760, // 1 year
  DEFAULT_MAX_USES: null, // unlimited
} as const;

/**
 * Currency decimal places
 */
export const CURRENCY_PRECISION = {
  USD: 2,
  EUR: 2,
  GBP: 2,
  JPY: 0,
  CAD: 2,
  AUD: 2,
  CHF: 2,
  CNY: 2,
  INR: 2,
} as const;

/**
 * Expense categories
 */
export const EXPENSE_CATEGORIES = [
  "Groceries",
  "Rent",
  "Utilities",
  "Dining",
  "Transportation",
  "Entertainment",
  "Shopping",
  "Healthcare",
  "Travel",
  "Other",
] as const;

/**
 * Supported currencies
 */
export const SUPPORTED_CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "CHF", symbol: "Fr", name: "Swiss Franc" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
] as const;

/**
 * Date formats
 */
export const DATE_FORMATS = {
  DISPLAY: "MMM d, yyyy",
  DISPLAY_WITH_TIME: "MMM d, yyyy 'at' h:mm a",
  INPUT: "yyyy-MM-dd",
  ISO: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
} as const;

/**
 * Validation constants
 */
export const VALIDATION = {
  GROUP_NAME_MIN: 1,
  GROUP_NAME_MAX: 100,
  DESCRIPTION_MAX: 500,
  EXPENSE_DESCRIPTION_MIN: 1,
  EXPENSE_DESCRIPTION_MAX: 200,
  CATEGORY_MAX: 50,
  PASSWORD_MIN: 8,
  PASSWORD_MAX: 100,
  NAME_MIN: 1,
  NAME_MAX: 100,
} as const;

/**
 * HTTP status codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;
