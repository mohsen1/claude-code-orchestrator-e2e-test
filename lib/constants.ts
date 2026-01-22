/**
 * Application-wide constants
 */

// ----------------------------------------------------------------------------
// Application Configuration
// ----------------------------------------------------------------------------

export const APP_NAME = 'SplitSync';
export const APP_VERSION = '1.0.0';
export const APP_DESCRIPTION = 'Real-time expense sharing application';

// ----------------------------------------------------------------------------
// Pagination
// ----------------------------------------------------------------------------

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// ----------------------------------------------------------------------------
// Validation Constraints
// ----------------------------------------------------------------------------

export const MIN_GROUP_NAME_LENGTH = 2;
export const MAX_GROUP_NAME_LENGTH = 50;
export const MAX_GROUP_DESCRIPTION_LENGTH = 500;

export const MIN_EXPENSE_DESCRIPTION_LENGTH = 2;
export const MAX_EXPENSE_DESCRIPTION_LENGTH = 200;
export const MAX_EXPENSE_NOTES_LENGTH = 1000;

export const MIN_USER_NAME_LENGTH = 2;
export const MAX_USER_NAME_LENGTH = 50;

export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 128;

// ----------------------------------------------------------------------------
// File Upload Constraints
// ----------------------------------------------------------------------------

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
export const MAX_RECEIPT_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const ALLOWED_RECEIPT_TYPES = [...ALLOWED_IMAGE_TYPES, 'application/pdf'];
export const MAX_AVATAR_FILE_SIZE = 2 * 1024 * 1024; // 2MB in bytes

// ----------------------------------------------------------------------------
// Currency Constants
// ----------------------------------------------------------------------------

export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  CAD: 'C$',
  AUD: 'A$',
  JPY: '¥',
  INR: '₹',
  CNY: '¥',
  CHF: 'CHF',
  SEK: 'kr',
  NOK: 'kr',
  DKK: 'kr',
  MXN: '$',
  BRL: 'R$',
  KRW: '₩',
  SGD: 'S$',
  HKD: 'HK$',
  NZD: 'NZ$',
  ZAR: 'R',
};

export const CURRENCY_DECIMALS: Record<string, number> = {
  JPY: 0,
  KRW: 0,
  USD: 2,
  EUR: 2,
  GBP: 2,
  CAD: 2,
  AUD: 2,
  INR: 2,
  CNY: 2,
  CHF: 2,
  SEK: 2,
  NOK: 2,
  DKK: 2,
  MXN: 2,
  BRL: 2,
  SGD: 2,
  HKD: 2,
  NZD: 2,
  ZAR: 2,
};

// ----------------------------------------------------------------------------
// Date & Time Constants
// ----------------------------------------------------------------------------

export const DATE_FORMATS = {
  DISPLAY: 'MMM d, yyyy',
  DISPLAY_WITH_TIME: 'MMM d, yyyy h:mm a',
  DISPLAY_SHORT: 'MMM d',
  ISO: "yyyy-MM-dd'T'HH:mm:ss",
  INPUT: 'yyyy-MM-dd',
} as const;

export const DEFAULT_TIMEZONE = 'UTC';

// ----------------------------------------------------------------------------
// Session & Auth Constants
// ----------------------------------------------------------------------------

export const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days in ms
export const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days in ms
export const EMAIL_VERIFICATION_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in ms
export const PASSWORD_RESET_EXPIRY = 1 * 60 * 60 * 1000; // 1 hour in ms
export const INVITE_LINK_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

// ----------------------------------------------------------------------------
// Rate Limiting Constants
// ----------------------------------------------------------------------------

export const RATE_LIMITS = {
  GENERAL: { maxRequests: 100, windowMs: 15 * 60 * 1000 }, // 100 requests per 15 minutes
  API: { maxRequests: 50, windowMs: 1 * 60 * 1000 }, // 50 requests per minute
  AUTH: { maxRequests: 5, windowMs: 1 * 60 * 1000 }, // 5 requests per minute
  UPLOAD: { maxRequests: 10, windowMs: 1 * 60 * 1000 }, // 10 uploads per minute
} as const;

// ----------------------------------------------------------------------------
// WebSocket Constants
// ----------------------------------------------------------------------------

export const WS_HEARTBEAT_INTERVAL = 25000; // 25 seconds
export const WS_HEARTBEAT_TIMEOUT = 5000; // 5 seconds
export const WS_MAX_CONNECTIONS_PER_USER = 5;
export const WS_MESSAGE_QUEUE_SIZE = 100;

// ----------------------------------------------------------------------------
// Settlement Constants
// ----------------------------------------------------------------------------

export const SETTLEMENT_STATUSES = ['pending', 'in_progress', 'completed', 'cancelled', 'failed'] as const;
export const PAYMENT_METHODS = ['cash', 'bank_transfer', 'paypal', 'venmo', 'zelle', 'wise', 'revolut', 'other'] as const;

// ----------------------------------------------------------------------------
// Expense Categories
// ----------------------------------------------------------------------------

export const EXPENSE_CATEGORIES = [
  'food',
  'transport',
  'accommodation',
  'entertainment',
  'shopping',
  'utilities',
  'health',
  'education',
  'business',
  'other',
] as const;

export const EXPENSE_CATEGORY_ICONS: Record<string, string> = {
  food: '🍔',
  transport: '🚗',
  accommodation: '🏠',
  entertainment: '🎬',
  shopping: '🛒',
  utilities: '💡',
  health: '🏥',
  education: '📚',
  business: '💼',
  other: '📝',
};

export const EXPENSE_CATEGORY_COLORS: Record<string, string> = {
  food: 'bg-orange-500',
  transport: 'bg-blue-500',
  accommodation: 'bg-purple-500',
  entertainment: 'bg-pink-500',
  shopping: 'bg-green-500',
  utilities: 'bg-yellow-500',
  health: 'bg-red-500',
  education: 'bg-indigo-500',
  business: 'bg-gray-500',
  other: 'bg-slate-500',
};

// ----------------------------------------------------------------------------
// Error Messages
// ----------------------------------------------------------------------------

export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'You must be logged in to perform this action',
  FORBIDDEN: 'You do not have permission to perform this action',
  NOT_FOUND: 'The requested resource was not found',
  INVALID_INPUT: 'Invalid input provided',
  RATE_LIMITED: 'Too many requests. Please try again later',
  INTERNAL_ERROR: 'An unexpected error occurred. Please try again',
  NETWORK_ERROR: 'Network error. Please check your connection',
  VALIDATION_ERROR: 'Validation failed',
  DUPLICATE_ENTRY: 'This entry already exists',
  EXPIRED_TOKEN: 'This link has expired',
  INVALID_TOKEN: 'Invalid token provided',
} as const;

// ----------------------------------------------------------------------------
// Success Messages
// ----------------------------------------------------------------------------

export const SUCCESS_MESSAGES = {
  EXPENSE_CREATED: 'Expense created successfully',
  EXPENSE_UPDATED: 'Expense updated successfully',
  EXPENSE_DELETED: 'Expense deleted successfully',
  SETTLEMENT_CREATED: 'Settlement created successfully',
  SETTLEMENT_COMPLETED: 'Settlement marked as complete',
  GROUP_CREATED: 'Group created successfully',
  GROUP_UPDATED: 'Group updated successfully',
  MEMBER_ADDED: 'Member added successfully',
  MEMBER_REMOVED: 'Member removed successfully',
  INVITE_SENT: 'Invite sent successfully',
  SETTINGS_SAVED: 'Settings saved successfully',
} as const;

// ----------------------------------------------------------------------------
// Feature Flags (default values, can be overridden by env vars)
// ----------------------------------------------------------------------------

export const FEATURE_FLAGS = {
  EMAIL_VERIFICATION: true,
  PASSWORD_RESET: true,
  OAUTH: true,
  WEBSOCKETS: true,
  EXPENSE_ATTACHMENTS: true,
  RECURRING_EXPENSES: true,
  SETTLEMENT_SCHEDULES: true,
  GROUP_CATEGORIES: true,
  BUDGETS: true,
  EXPORT_DATA: true,
} as const;

// ----------------------------------------------------------------------------
// Regex Patterns
// ----------------------------------------------------------------------------

export const PATTERNS = {
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  PASSWORD_STRENGTH: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  SLUG: /^[a-z0-9-]+$/,
  HEX_COLOR: /^#?([a-f0-9]{6}|[a-f0-9]{3})$/i,
  CURRENCY_CODE: /^[A-Z]{3}$/,
  URL: /^https?:\/\/.+/,
} as const;

// ----------------------------------------------------------------------------
// Animation Durations (in ms)
// ----------------------------------------------------------------------------

export const ANIMATION_DURATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;

// ----------------------------------------------------------------------------
// Breakpoint Values (in px)
// ----------------------------------------------------------------------------

export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const;

// ----------------------------------------------------------------------------
// Storage Keys
// ----------------------------------------------------------------------------

export const STORAGE_KEYS = {
  THEME: 'splitsync-theme',
  SIDEBAR_COLLAPSED: 'splitsync-sidebar-collapsed',
  RECENT_GROUPS: 'splitsync-recent-groups',
  NOTIFICATIONS_DISABLED: 'splitsync-notifications-disabled',
} as const;

// ----------------------------------------------------------------------------
// Webhook Events
// ----------------------------------------------------------------------------

export const WEBHOOK_EVENTS = [
  'expense.created',
  'expense.updated',
  'expense.deleted',
  'group.created',
  'group.updated',
  'group.member_added',
  'group.member_removed',
  'settlement.created',
  'settlement.completed',
] as const;
