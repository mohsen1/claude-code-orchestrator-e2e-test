/**
 * ============================================================================
 * APPLICATION CONFIGURATION
 * ============================================================================
 */

/**
 * Application metadata
 */
export const appConfig = {
  name: "SplitSync",
  description: "Split expenses with friends and family",
  version: "1.0.0",
  author: "SplitSync Team",

  // URLs
  get baseUrl(): string {
    if (typeof window !== "undefined") {
      return window.location.origin;
    }
    return process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";
  },

  apiUrl: process.env.NEXT_PUBLIC_API_URL || "/api",
} as const;

/**
 * Database configuration
 */
export const dbConfig = {
  url: process.env.DATABASE_URL || "file:./sqlite.db",

  // Connection pool settings
  pool: {
    min: 1,
    max: 10,
  },

  // Migration settings
  migrations: {
    table: "migrations",
    directory: "./migrations",
  },
} as const;

/**
 * Authentication configuration
 */
export const authConfig = {
  secret: process.env.AUTH_SECRET || "",
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 1 day
  },

  providers: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
    credentials: {
      enabled: true,
    },
  },

  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login",
    verifyRequest: "/verify-request",
    newUser: "/onboarding",
  },
} as const;

/**
 * Currency configuration
 */
export const currencyConfig = {
  default: "USD" as const,

  // Available currencies
  available: [
    { code: "USD", symbol: "$", name: "US Dollar", flag: "🇺🇸" },
    { code: "EUR", symbol: "€", name: "Euro", flag: "🇪🇺" },
    { code: "GBP", symbol: "£", name: "British Pound", flag: "🇬🇧" },
    { code: "JPY", symbol: "¥", name: "Japanese Yen", flag: "🇯🇵" },
    { code: "CAD", symbol: "$", name: "Canadian Dollar", flag: "🇨🇦" },
    { code: "AUD", symbol: "$", name: "Australian Dollar", flag: "🇦🇺" },
    { code: "CHF", symbol: "CHF", name: "Swiss Franc", flag: "🇨🇭" },
    { code: "CNY", symbol: "¥", name: "Chinese Yuan", flag: "🇨🇳" },
    { code: "INR", symbol: "₹", name: "Indian Rupee", flag: "🇮🇳" },
    { code: "MXN", symbol: "$", name: "Mexican Peso", flag: "🇲🇽" },
    { code: "BRL", symbol: "R$", name: "Brazilian Real", flag: "🇧🇷" },
    { code: "SEK", symbol: "kr", name: "Swedish Krona", flag: "🇸🇪" },
    { code: "NOK", symbol: "kr", name: "Norwegian Krone", flag: "🇳🇴" },
    { code: "DKK", symbol: "kr", name: "Danish Krone", flag: "🇩🇰" },
    { code: "SGD", symbol: "$", name: "Singapore Dollar", flag: "🇸🇬" },
    { code: "HKD", symbol: "$", name: "Hong Kong Dollar", flag: "🇭🇰" },
    { code: "KRW", symbol: "₩", name: "South Korean Won", flag: "🇰🇷" },
    { code: "TRY", symbol: "₺", name: "Turkish Lira", flag: "🇹🇷" },
    { code: "PLN", symbol: "zł", name: "Polish Zloty", flag: "🇵🇱" },
    { code: "THB", symbol: "฿", name: "Thai Baht", flag: "🇹🇭" },
  ],

  // Get currency info by code
  getCurrencyInfo(code: string) {
    return this.available.find((c) => c.code === code) || this.available[0];
  },
} as const;

/**
 * Expense categories
 */
export const expenseCategories = [
  { id: "food", name: "Food & Drinks", icon: "🍔", color: "#ef4444" },
  { id: "transport", name: "Transportation", icon: "🚗", color: "#3b82f6" },
  { id: "accommodation", name: "Accommodation", icon: "🏠", color: "#8b5cf6" },
  { id: "entertainment", name: "Entertainment", icon: "🎬", color: "#ec4899" },
  { id: "shopping", name: "Shopping", icon: "🛍️", color: "#f97316" },
  { id: "utilities", name: "Utilities", icon: "💡", color: "#eab308" },
  { id: "healthcare", name: "Healthcare", icon: "💊", color: "#22c55e" },
  { id: "education", name: "Education", icon: "📚", color: "#06b6d4" },
  { id: "travel", name: "Travel", icon: "✈️", color: "#6366f1" },
  { id: "other", name: "Other", icon: "📦", color: "#6b7280" },
] as const;

/**
 * Pagination defaults
 */
export const paginationConfig = {
  defaultPageSize: 20,
  maxPageSize: 100,
  pageSizes: [10, 20, 50, 100],
} as const;

/**
 * API configuration
 */
export const apiConfig = {
  // Rate limiting
  rateLimit: {
    windowMs: 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute
  },

  // Request timeout
  timeout: 30000, // 30 seconds

  // Retry configuration
  retry: {
    attempts: 3,
    delay: 1000, // 1 second
    backoffMultiplier: 2,
  },

  // Pagination defaults
  defaultPage: 1,
  defaultPageSize: 20,

  // CORS settings
  cors: {
    origin: process.env.NODE_ENV === "production"
      ? process.env.NEXT_PUBLIC_APP_URL
      : ["http://localhost:3000", "http://localhost:3001"],
    credentials: true,
  },
} as const;

/**
 * File upload configuration
 */
export const uploadConfig = {
  // Maximum file size (5MB)
  maxSize: 5 * 1024 * 1024,

  // Allowed image types
  allowedTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],

  // Avatar dimensions
  avatar: {
    width: 200,
    height: 200,
    quality: 90,
  },

  // Receipt image dimensions
  receipt: {
    width: 1200,
    height: 1600,
    quality: 85,
  },
} as const;

/**
 * Email configuration
 */
export const emailConfig = {
  from: process.env.EMAIL_FROM || "noreply@splitsync.app",
  replyTo: process.env.EMAIL_REPLY_TO || "support@splitsync.app",

  templates: {
    invite: {
      subject: "You're invited to join a group on SplitSync",
      expiryHours: 168, // 7 days
    },
    verification: {
      subject: "Verify your email address",
      expiryHours: 24,
    },
    passwordReset: {
      subject: "Reset your password",
      expiryHours: 1,
    },
    settlement: {
      subject: "Settlement confirmation",
    },
    expenseAdded: {
      subject: "New expense added",
    },
  },
} as const;

/**
 * Socket.io configuration
 */
export const socketConfig = {
  enabled: true,
  path: "/api/socket",
  cors: {
    origin: process.env.NODE_ENV === "production"
      ? process.env.NEXT_PUBLIC_APP_URL
      : ["http://localhost:3000", "http://localhost:3001"],
    credentials: true,
  },

  // Heartbeat interval
  pingTimeout: 60000,
  pingInterval: 25000,

  // Room configuration
  rooms: {
    groupPrefix: "group:",
  },
} as const;

/**
 * Feature flags
 */
export const featureFlags = {
  // Enable/disable features
  enableOAuth: process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
  enableEmailNotifications: !!process.env.EMAIL_SERVER,
  enableReceiptUploads: true,
  enableAnalytics: process.env.NODE_ENV === "production",
  enableSocket: true,

  // Beta features
  enableRecurringExpenses: false,
  enableBudgetCategories: false,
  enableExpenseExport: false,
  enableMultiCurrency: true,
} as const;

/**
 * Security configuration
 */
export const securityConfig = {
  // Password requirements
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
  },

  // Session settings
  session: {
    absoluteDuration: 30 * 24 * 60 * 60, // 30 days
    rollingDuration: 24 * 60 * 60, // 1 day
    rolling: true,
  },

  // Rate limiting
  rateLimit: {
    authentication: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5, // 5 attempts
    },
    general: {
      windowMs: 60 * 1000, // 1 minute
      max: 100, // 100 requests
    },
  },

  // CSRF protection
  csrf: {
    enabled: true,
    tokenSize: 32,
  },
} as const;

/**
 * Invite link configuration
 */
export const inviteConfig = {
  // Link expiration
  expiresIn: 7 * 24 * 60 * 60 * 1000, // 7 days

  // Maximum uses
  maxUses: 100,

  // Token length
  tokenLength: 32,

  // Base URL for invite links
  get baseUrl(): string {
    return `${appConfig.baseUrl}/invite`;
  },
} as const;

/**
 * Date/time configuration
 */
export const dateTimeConfig = {
  // Default timezone
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,

  // Date formats
  formats: {
    short: "MMM d, yyyy",
    long: "MMMM d, yyyy 'at' h:mm a",
    time: "h:mm a",
    dateTime: "MMM d, yyyy, h:mm a",
  },

  // First day of week (0 = Sunday, 1 = Monday)
  firstDayOfWeek: 0,
} as const;

/**
 * Logging configuration
 */
export const loggingConfig = {
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === "production" ? "info" : "debug"),

  // Enable colors in console
  colors: process.env.NODE_ENV !== "production",

  // Log format
  format: process.env.NODE_ENV === "production" ? "json" : "pretty",
} as const;

/**
 * Monitoring and analytics
 */
export const monitoringConfig = {
  // Error tracking (e.g., Sentry)
  sentry: {
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    enabled: !!process.env.SENTRY_DSN,
  },

  // Analytics (e.g., Google Analytics, Plausible)
  analytics: {
    enabled: process.env.NODE_ENV === "production",
    id: process.env.NEXT_PUBLIC_GA_ID,
  },
} as const;

/**
 * Localization configuration
 */
export const i18nConfig = {
  defaultLocale: "en",
  locales: ["en", "es", "fr", "de", "pt", "zh", "ja", "ko"] as const,

  // Date formatting locales
  dateLocales: {
    en: "en-US",
    es: "es-ES",
    fr: "fr-FR",
    de: "de-DE",
    pt: "pt-BR",
    zh: "zh-CN",
    ja: "ja-JP",
    ko: "ko-KR",
  },
} as const;

/**
 * Export all configuration
 */
export const config = {
  app: appConfig,
  db: dbConfig,
  auth: authConfig,
  currency: currencyConfig,
  categories: expenseCategories,
  pagination: paginationConfig,
  api: apiConfig,
  upload: uploadConfig,
  email: emailConfig,
  socket: socketConfig,
  features: featureFlags,
  security: securityConfig,
  invite: inviteConfig,
  dateTime: dateTimeConfig,
  logging: loggingConfig,
  monitoring: monitoringConfig,
  i18n: i18nConfig,
} as const;

/**
 * Type-safe environment variable checker
 */
export function getEnvVar(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

/**
 * Get optional environment variable with fallback
 */
export function getOptionalEnvVar(key: string, fallback: string = ""): string {
  return process.env[key] || fallback;
}

/**
 * Check if running in development mode
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === "development";
}

/**
 * Check if running in production mode
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

/**
 * Check if running in test mode
 */
export function isTest(): boolean {
  return process.env.NODE_ENV === "test";
}
