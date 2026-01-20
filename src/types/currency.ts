/**
 * Currency type definitions for SplitSync
 * All monetary values are stored as integers (cents/smallest unit) to avoid floating-point errors
 */

/**
 * Supported currency codes (ISO 4217)
 */
export type CurrencyCode =
  | 'USD' // US Dollar
  | 'EUR' // Euro
  | 'GBP' // British Pound
  | 'JPY' // Japanese Yen
  | 'CAD' // Canadian Dollar
  | 'AUD' // Australian Dollar
  | 'CHF' // Swiss Franc
  | 'CNY' // Chinese Yuan
  | 'INR' // Indian Rupee
  | 'MXN' // Mexican Peso
  | 'BRL' // Brazilian Real
  | 'KRW' // South Korean Won
  | 'SGD' // Singapore Dollar
  | 'HKD' // Hong Kong Dollar
  | 'NOK' // Norwegian Krone
  | 'SEK' // Swedish Krona
  | 'DKK' // Danish Krone
  | 'PLN' // Polish Zloty
  | 'THB' // Thai Baht
  | 'IDR' // Indonesian Rupiah
  | 'TRY' // Turkish Lira
  | 'RUB' // Russian Ruble
  | 'ZAR' // South African Rand
  | 'PHP' // Philippine Peso
  | 'MYR' // Malaysian Ringgit
  | 'VND' // Vietnamese Dong
  | 'CZK' // Czech Koruna
  | 'HUF' // Hungarian Forint
  | 'ILS' // Israeli New Shekel
  | 'AED' // UAE Dirham
  | 'SAR' // Saudi Riyal
  | 'EGP' // Egyptian Pound
  | 'NGN' // Nigerian Naira
  | 'KES' // Kenyan Shilling
  | 'GHS' // Ghanaian Cedi
  | 'UGX'; // Ugandan Shilling

/**
 * Currency metadata
 */
export interface CurrencyInfo {
  code: CurrencyCode;
  symbol: string;
  name: string;
  decimals: number; // Number of decimal places (0 for JPY, 2 for USD/EUR, etc.)
  position: 'before' | 'after'; // Symbol position relative to amount
  space: boolean; // Whether to add space between symbol and amount
}

/**
 * Map of currency codes to their metadata
 */
export const CURRENCY_MAP: Readonly<Record<CurrencyCode, CurrencyInfo>> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', decimals: 2, position: 'before', space: false },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', decimals: 2, position: 'after', space: false },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', decimals: 2, position: 'before', space: false },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', decimals: 0, position: 'before', space: false },
  CAD: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', decimals: 2, position: 'before', space: false },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', decimals: 2, position: 'before', space: false },
  CHF: { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc', decimals: 2, position: 'before', space: true },
  CNY: { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', decimals: 2, position: 'before', space: false },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', decimals: 2, position: 'before', space: false },
  MXN: { code: 'MXN', symbol: '$', name: 'Mexican Peso', decimals: 2, position: 'before', space: false },
  BRL: { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', decimals: 2, position: 'before', space: false },
  KRW: { code: 'KRW', symbol: '₩', name: 'South Korean Won', decimals: 0, position: 'before', space: false },
  SGD: { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', decimals: 2, position: 'before', space: false },
  HKD: { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar', decimals: 2, position: 'before', space: false },
  NOK: { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone', decimals: 2, position: 'after', space: true },
  SEK: { code: 'SEK', symbol: 'kr', name: 'Swedish Krona', decimals: 2, position: 'after', space: true },
  DKK: { code: 'DKK', symbol: 'kr', name: 'Danish Krone', decimals: 2, position: 'after', space: true },
  PLN: { code: 'PLN', symbol: 'zł', name: 'Polish Zloty', decimals: 2, position: 'after', space: false },
  THB: { code: 'THB', symbol: '฿', name: 'Thai Baht', decimals: 2, position: 'before', space: false },
  IDR: { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah', decimals: 0, position: 'before', space: false },
  TRY: { code: 'TRY', symbol: '₺', name: 'Turkish Lira', decimals: 2, position: 'before', space: false },
  RUB: { code: 'RUB', symbol: '₽', name: 'Russian Ruble', decimals: 2, position: 'before', space: false },
  ZAR: { code: 'ZAR', symbol: 'R', name: 'South African Rand', decimals: 2, position: 'before', space: false },
  PHP: { code: 'PHP', symbol: '₱', name: 'Philippine Peso', decimals: 2, position: 'before', space: false },
  MYR: { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit', decimals: 2, position: 'before', space: false },
  VND: { code: 'VND', symbol: '₫', name: 'Vietnamese Dong', decimals: 0, position: 'after', space: true },
  CZK: { code: 'CZK', symbol: 'Kč', name: 'Czech Koruna', decimals: 2, position: 'after', space: false },
  HUF: { code: 'HUF', symbol: 'Ft', name: 'Hungarian Forint', decimals: 2, position: 'after', space: true },
  ILS: { code: 'ILS', symbol: '₪', name: 'Israeli New Shekel', decimals: 2, position: 'before', space: false },
  AED: { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', decimals: 2, position: 'after', space: true },
  SAR: { code: 'SAR', symbol: 'ر.س', name: 'Saudi Riyal', decimals: 2, position: 'after', space: true },
  EGP: { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound', decimals: 2, position: 'before', space: false },
  NGN: { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', decimals: 2, position: 'before', space: false },
  KES: { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', decimals: 2, position: 'before', space: false },
  GHS: { code: 'GHS', symbol: 'GH₵', name: 'Ghanaian Cedi', decimals: 2, position: 'before', space: false },
  UGX: { code: 'UGX', symbol: 'USh', name: 'Ugandan Shilling', decimals: 0, position: 'before', space: false },
} as const;

/**
 * Monetary amount stored as integer (cents/smallest unit)
 * Example: $10.50 = 1050, ¥1000 = 1000
 */
export type MonetaryAmount = number;

/**
 * Validates if a value is a valid monetary amount
 * @param amount - The amount to validate
 * @returns True if valid
 */
export function isValidMonetaryAmount(amount: number): boolean {
  return Number.isInteger(amount) && amount >= 0;
}

/**
 * Converts decimal amount to monetary amount (integer storage)
 * @param decimalAmount - Amount in decimal format (e.g., 10.50)
 * @param currency - Currency code to determine decimal places
 * @returns Monetary amount as integer (e.g., 1050)
 * @throws Error if currency is not supported
 */
export function decimalToMonetary(decimalAmount: number, currency: CurrencyCode): MonetaryAmount {
  if (!isValidMonetaryAmount(decimalAmount * 100)) {
    throw new Error('Invalid decimal amount');
  }

  const decimals = CURRENCY_MAP[currency]?.decimals ?? 2;
  const multiplier = Math.pow(10, decimals);
  return Math.round(decimalAmount * multiplier);
}

/**
 * Converts monetary amount to decimal for display
 * @param monetaryAmount - Amount in integer format (e.g., 1050)
 * @param currency - Currency code to determine decimal places
 * @returns Decimal amount (e.g., 10.50)
 */
export function monetaryToDecimal(monetaryAmount: MonetaryAmount, currency: CurrencyCode): number {
  if (!isValidMonetaryAmount(monetaryAmount)) {
    throw new Error('Invalid monetary amount');
  }

  const decimals = CURRENCY_MAP[currency]?.decimals ?? 2;
  const divisor = Math.pow(10, decimals);
  return monetaryAmount / divisor;
}

/**
 * Formats a monetary amount for display with currency symbol
 * @param monetaryAmount - Amount in integer format
 * @param currency - Currency code
 * @returns Formatted string (e.g., "$10.50" or "10,50 €")
 */
export function formatCurrency(monetaryAmount: MonetaryAmount, currency: CurrencyCode): string {
  const info = CURRENCY_MAP[currency];
  if (!info) {
    throw new Error(`Unsupported currency: ${currency}`);
  }

  const decimalAmount = monetaryToDecimal(monetaryAmount, currency);
  const formattedNumber = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: info.decimals,
    maximumFractionDigits: info.decimals,
  }).format(decimalAmount);

  const space = info.space ? ' ' : '';

  return info.position === 'before'
    ? `${info.symbol}${space}${formattedNumber}`
    : `${formattedNumber}${space}${info.symbol}`;
}

/**
 * Adds two monetary amounts (safe integer arithmetic)
 */
export function addMonetaryAmounts(a: MonetaryAmount, b: MonetaryAmount): MonetaryAmount {
  if (!isValidMonetaryAmount(a) || !isValidMonetaryAmount(b)) {
    throw new Error('Invalid monetary amounts');
  }
  return a + b;
}

/**
 * Subtracts two monetary amounts (safe integer arithmetic)
 */
export function subtractMonetaryAmounts(a: MonetaryAmount, b: MonetaryAmount): MonetaryAmount {
  if (!isValidMonetaryAmount(a) || !isValidMonetaryAmount(b)) {
    throw new Error('Invalid monetary amounts');
  }
  if (b > a) {
    throw new Error('Result would be negative');
  }
  return a - b;
}

/**
 * Divides a monetary amount, distributing remainder to first recipients
 * Used for splitting expenses evenly
 * @param amount - Total amount to split
 * @param parts - Number of parts to split into
 * @returns Array of split amounts
 */
export function splitMonetaryAmount(amount: MonetaryAmount, parts: number): MonetaryAmount[] {
  if (!isValidMonetaryAmount(amount) || !Number.isInteger(parts) || parts <= 0) {
    throw new Error('Invalid split parameters');
  }

  const baseAmount = Math.floor(amount / parts);
  const remainder = amount % parts;

  const result: MonetaryAmount[] = [];
  for (let i = 0; i < parts; i++) {
    // Distribute remainder to first 'remainder' recipients
    result.push(baseAmount + (i < remainder ? 1 : 0));
  }

  // Verify sum equals original
  const sum = result.reduce((acc, val) => acc + val, 0);
  if (sum !== amount) {
    throw new Error('Split calculation error: sum does not equal original amount');
  }

  return result;
}
