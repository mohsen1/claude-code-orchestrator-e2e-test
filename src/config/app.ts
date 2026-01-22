/**
 * Application configuration
 * Centralizes all environment variables and app settings
 */

export const config = {
  app: {
    name: process.env.APP_NAME || 'SplitSync',
    url: process.env.APP_URL || 'http://localhost:3000',
    description: 'A modern, real-time expense sharing application',
  },

  env: {
    nodeEnv: process.env.NODE_ENV || 'development',
    isDevelopment: process.env.NODE_ENV !== 'production',
    isProduction: process.env.NODE_ENV === 'production',
    isTest: process.env.NODE_ENV === 'test',
  },

  database: {
    url: process.env.DATABASE_URL || 'file:./data/splitsync.db',
  },

  auth: {
    secret: process.env.NEXTAUTH_SECRET || '',
    url: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    maxAge: parseInt(process.env.SESSION_MAX_AGE || '604800', 10), // 7 days
    updateAge: parseInt(process.env.SESSION_UPDATE_AGE || '86400', 10), // 1 day
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
  },

  oauth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    },
  },

  email: {
    smtp: {
      host: process.env.SMTP_HOST || '',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      user: process.env.SMTP_USER || '',
      password: process.env.SMTP_PASSWORD || '',
      from: process.env.SMTP_FROM || 'noreply@splitsync.app',
    },
  },

  redis: {
    url: process.env.REDIS_URL || '',
  },

  rateLimit: {
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
  },

  features: {
    enableRegistration: process.env.ENABLE_REGISTRATION !== 'false',
    enableInvites: process.env.ENABLE_INVITES !== 'false',
    enableRealtime: process.env.ENABLE_REALTIME !== 'false',
  },

  inviteLinks: {
    expiryDays: parseInt(process.env.INVITE_LINK_EXPIRY_DAYS || '7', 10),
    maxUses: parseInt(process.env.INVITE_LINK_MAX_USES || '1', 10),
  },

  fileUpload: {
    maxSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB || '5', 10),
    allowedTypes: (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/gif,application/pdf').split(
      ','
    ),
  },

  monitoring: {
    sentry: {
      dsn: process.env.SENTRY_DSN || '',
      environment: process.env.SENTRY_ENVIRONMENT || 'development',
    },
  },

  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json',
  },

  pagination: {
    defaultPageSize: 20,
    maxPageSize: 100,
  },

  currencies: [
    'USD',
    'EUR',
    'GBP',
    'CAD',
    'AUD',
    'JPY',
    'CHF',
    'CNY',
    'INR',
    'MXN',
    'BRL',
    'KRW',
    'RUB',
    'ZAR',
  ] as const,

  expenseCategories: [
    'food',
    'transport',
    'accommodation',
    'entertainment',
    'utilities',
    'shopping',
    'health',
    'education',
    'travel',
    'other',
  ] as const,
};

// Type helpers
export type CurrencyCode = (typeof config.currencies)[number];
export type ExpenseCategory = (typeof config.expenseCategories)[number];

// Validation helper
export function validateConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (config.env.isProduction && !config.auth.secret) {
    errors.push('NEXTAUTH_SECRET is required in production');
  }

  if (!config.database.url) {
    errors.push('DATABASE_URL is required');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
