import { z } from "zod";
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  createGroupSchema,
  updateGroupSchema,
  createExpenseSchema,
  createSettlementSchema,
} from "./validations";

/**
 * Form Types for React Hook Form + Zod Integration
 *
 * These types represent the shape of form data that will be validated
 * against Zod schemas and submitted to the server.
 */

/**
 * Authentication Forms
 */

/**
 * Registration Form Fields
 * Used for new user sign-up
 */
export type RegisterFormData = z.infer<typeof registerSchema>;

/**
 * Login Form Fields
 * Used for user authentication
 */
export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Profile Update Form Fields
 * Used for updating user profile information
 */
export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;

/**
 * Group Forms
 */

/**
 * Create Group Form Fields
 * Used for creating a new expense-sharing group
 */
export type CreateGroupFormData = z.infer<typeof createGroupSchema>;

/**
 * Update Group Form Fields
 * Used for updating group details
 */
export type UpdateGroupFormData = z.infer<typeof updateGroupSchema>;

/**
 * Expense Forms
 */

/**
 * Create Expense Form Fields
 * Used for adding a new expense
 *
 * Note: The form accepts amount in decimal format (e.g., "10.50" for $10.50)
 * but will be converted to cents (1050) before submission to the API.
 *
 * The splits field (if present) also uses ExpenseSplitFormData so that
 * split amounts are represented as decimal strings in the form.
 */
export type CreateExpenseFormData = Omit<
  z.infer<typeof createExpenseSchema>,
  "amount" | "splits"
> & {
  amount: string; // Decimal string for display (e.g., "10.50")
  splits?: ExpenseSplitFormData[]; // Form-friendly splits with string amounts
};

/**
 * Update Expense Form Fields
 * Used for modifying existing expenses
 */
export type UpdateExpenseFormData = {
  amount?: string; // Decimal string for display
  description?: string;
  date?: Date | string;
};

/**
 * Expense Split Form Fields
 * Used for defining how an expense is split among members
 */
export interface ExpenseSplitFormData {
  userId: string;
  userName: string;
  amount: string; // Decimal string for display
  shareType: "equal" | "exact" | "percentage";
  percentage?: number; // Used when shareType is "percentage"
}

/**
 * Settlement Forms
 */

/**
 * Create Settlement Form Fields
 * Used for recording a payment between users
 */
export type CreateSettlementFormData = Omit<z.infer<typeof createSettlementSchema>, "amount"> & {
  amount: string; // Decimal string for display (e.g., "10.50")
};

/**
 * Form State & Error Types
 */

/**
 * Generic form field error type
 */
export type FormFieldError = {
  type: string;
  message: string;
};

/**
 * Generic form errors type
 * Maps field names to their errors
 */
export type FormErrors<T> = {
  [K in keyof T]?: FormFieldError | FormFieldError[];
};

/**
 * Form Submission State
 */
export type FormSubmitState = {
  isSubmitting: boolean;
  isValid: boolean;
  isLoading: boolean;
  error?: string;
  success?: boolean;
};

/**
 * Extended Form Props
 * Common props for form components
 */
export interface FormProps<T> {
  initialValues?: Partial<T>;
  onSubmit: (data: T) => Promise<void> | void;
  onCancel?: () => void;
  loading?: boolean;
  disabled?: boolean;
}

/**
 * Select Option Types
 * Used for dropdown/select components
 */
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: string;
}

/**
 * Member Selection Type
 * Used for selecting users in expense splits
 */
export interface MemberSelectOption extends SelectOption {
  userId: string;
  userImage?: string;
  balance?: number; // User's current balance in the group (in cents)
}

/**
 * Currency Display Type
 * Used for formatting currency in forms
 */
export interface CurrencyDisplay {
  code: string; // ISO 4217 code (e.g., "USD")
  symbol: string; // Symbol (e.g., "$")
  position: "before" | "after"; // Where to place the symbol
  decimals: number; // Number of decimal places (usually 2)
}

/**
 * Form Validation Context
 * Provides validation context to form components
 */
export interface FormValidationContext {
  groupId?: string; // Current group ID for validation
  currency?: string; // Current group currency
  members?: MemberSelectOption[]; // Available members for selection
  payerId?: string; // Current user ID as default payer
}

/**
 * Expense Split Type
 * Represents how an expense is split
 */
export interface ExpenseSplit {
  userId: string;
  userName: string;
  amount: number; // Amount in cents
  percentage?: number; // Percentage if split by percentage
}

/**
 * Form Data Transformation Utilities
 * These are type definitions for utility functions
 */

/**
 * Input for converting decimal string to cents
 */
export type DecimalToCentsInput = {
  amount: string;
  currencyCode?: string;
};

/**
 * Input for converting cents to decimal string
 */
export type CentsToDecimalInput = {
  amount: number;
  currencyCode?: string;
  decimals?: number;
};

/**
 * Expense Form Calculation Result
 * Result of calculating expense splits
 */
export interface ExpenseSplitCalculation {
  totalAmount: number; // Total in cents
  splits: ExpenseSplit[]; // Calculated splits
  remainder: number; // Remainder cents distributed
  perPersonAmount: number; // Amount per person before remainder
}

/**
 * Invite Member Form Fields
 */
export interface InviteMemberFormData {
  email: string;
  role: "admin" | "member";
}

/**
 * Group Settings Form Fields
 */
export interface GroupSettingsFormData {
  name: string;
  currency: string;
}

/**
 * Date Range Filter Form Fields
 * Used for filtering expenses by date range
 */
export interface DateRangeFormData {
  startDate?: Date | string;
  endDate?: Date | string;
}

/**
 * Pagination Form Fields
 */
export interface PaginationFormData {
  page: number;
  limit: number;
}

/**
 * Sort Form Fields
 */
export interface SortFormData {
  sortBy: string;
  sortOrder: "asc" | "desc";
}

/**
 * Filter Form Fields
 * Combined filter, sort, and pagination
 */
export interface FilterFormData extends DateRangeFormData, PaginationFormData, SortFormData {
  search?: string;
  userIds?: string[];
  minAmount?: number;
  maxAmount?: number;
}
