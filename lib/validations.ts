import { z } from "zod";

/**
 * ============================================================================
 * COMMON VALIDATION SCHEMAS
 * ============================================================================
 */

/**
 * UUID validation schema
 */
export const uuidSchema = z.string().uuid("Invalid ID format");

/**
 * Email validation schema
 */
export const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Invalid email address");

/**
 * Password validation schema
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(
    /[^A-Za-z0-9]/,
    "Password must contain at least one special character"
  );

/**
 * Name validation schema
 */
export const nameSchema = z
  .string()
  .min(1, "Name is required")
  .max(100, "Name must be less than 100 characters")
  .trim();

/**
 * Currency code validation (ISO 4217)
 */
export const currencySchema = z.enum(
  [
    "USD",
    "EUR",
    "GBP",
    "JPY",
    "CAD",
    "AUD",
    "CHF",
    "CNY",
    "INR",
    "MXN",
    "BRL",
    "SEK",
    "NOK",
    "DKK",
    "SGD",
    "HKD",
    "KRW",
    "TRY",
    "PLN",
    "THB",
  ],
  {
    errorMap: () => ({ message: "Invalid currency code" }),
  }
);

/**
 * Amount validation schema
 * Accepts decimal numbers (e.g., 10.50) and converts to cents internally
 */
export const amountSchema = z
  .number({
    required_error: "Amount is required",
    invalid_type_error: "Amount must be a number",
  })
  .positive("Amount must be positive")
  .max(999999.99, "Amount is too large")
  .refine(
    (val) => {
      // Ensure maximum 2 decimal places
      const decimalPlaces = val.toString().split(".")[1]?.length || 0;
      return decimalPlaces <= 2;
    },
    {
      message: "Amount can have maximum 2 decimal places",
    }
  );

/**
 * Date validation schema
 */
export const dateSchema = z
  .string()
  .datetime("Invalid date format")
  .or(z.date())
  .optional();

/**
 * Pagination parameters
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

/**
 * ============================================================================
 * USER VALIDATION SCHEMAS
 * ============================================================================
 */

/**
 * User registration schema
 */
export const registerUserSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
});

/**
 * User login schema
 */
export const loginUserSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

/**
 * User update schema
 */
export const updateUserSchema = z.object({
  name: nameSchema.optional(),
  image: z.string().url().nullable().optional(),
});

/**
 * ============================================================================
 * GROUP VALIDATION SCHEMAS
 * ============================================================================
 */

/**
 * Group name schema
 */
export const groupNameSchema = z
  .string()
  .min(3, "Group name must be at least 3 characters")
  .max(50, "Group name must be less than 50 characters")
  .trim();

/**
 * Create group schema
 */
export const createGroupSchema = z.object({
  name: groupNameSchema,
  currency: currencySchema.default("USD"),
});

/**
 * Update group schema
 */
export const updateGroupSchema = z.object({
  name: groupNameSchema.optional(),
  currency: currencySchema.optional(),
});

/**
 * Group ID parameter schema
 */
export const groupIdParamSchema = z.object({
  groupId: uuidSchema,
});

/**
 * ============================================================================
 * GROUP MEMBER VALIDATION SCHEMAS
 * ============================================================================
 */

/**
 * Group member role schema
 */
export const groupRoleSchema = z.enum(["admin", "member"], {
  errorMap: () => ({ message: "Invalid role. Must be 'admin' or 'member'" }),
});

/**
 * Add group member schema
 */
export const addGroupMemberSchema = z.object({
  userId: uuidSchema,
  role: groupRoleSchema.default("member"),
});

/**
 * Update group member role schema
 */
export const updateGroupMemberRoleSchema = z.object({
  role: groupRoleSchema,
});

/**
 * ============================================================================
 * EXPENSE VALIDATION SCHEMAS
 * ============================================================================
 */

/**
 * Expense description schema
 */
export const expenseDescriptionSchema = z
  .string()
  .min(1, "Description is required")
  .max(200, "Description must be less than 200 characters")
  .trim();

/**
 * Expense category schema
 */
export const expenseCategorySchema = z
  .string()
  .max(50, "Category must be less than 50 characters")
  .trim()
  .optional()
  .nullable();

/**
 * Split type schema
 */
export const splitTypeSchema = z.enum(["equal", "exact", "percentage"], {
  errorMap: () => ({
    message: "Invalid split type. Must be 'equal', 'exact', or 'percentage'",
  }),
});

/**
 * Expense split item schema
 */
export const expenseSplitItemSchema = z.object({
  userId: uuidSchema,
  amount: z.number().positive().optional(),
  percentage: z
    .number()
    .min(0, "Percentage cannot be negative")
    .max(100, "Percentage cannot exceed 100")
    .optional(),
});

/**
 * Create expense schema
 */
export const createExpenseSchema = z
  .object({
    groupId: uuidSchema,
    payerId: uuidSchema,
    amount: amountSchema,
    description: expenseDescriptionSchema,
    category: expenseCategorySchema,
    date: dateSchema,
    splitType: splitTypeSchema.default("equal"),
    splits: z.array(expenseSplitItemSchema).optional(),
  })
  .refine(
    (data) => {
      // If split type is 'exact' or 'percentage', splits must be provided
      if (
        (data.splitType === "exact" || data.splitType === "percentage") &&
        (!data.splits || data.splits.length === 0)
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Splits are required for 'exact' or 'percentage' split types",
      path: ["splits"],
    }
  )
  .refine(
    (data) => {
      // Validate percentage splits sum to 100
      if (data.splitType === "percentage" && data.splits) {
        const totalPercentage = data.splits.reduce(
          (sum, split) => sum + (split.percentage || 0),
          0
        );
        return Math.abs(totalPercentage - 100) < 0.01;
      }
      return true;
    },
    {
      message: "Percentage splits must sum to 100",
      path: ["splits"],
    }
  )
  .refine(
    (data) => {
      // Validate exact splits sum to total amount
      if (data.splitType === "exact" && data.splits) {
        const totalAmount = data.splits.reduce(
          (sum, split) => sum + (split.amount || 0),
          0
        );
        return Math.abs(totalAmount - data.amount) < 0.01;
      }
      return true;
    },
    {
      message: "Exact splits must sum to the total amount",
      path: ["splits"],
    }
  );

/**
 * Update expense schema
 */
export const updateExpenseSchema = z
  .object({
    amount: amountSchema.optional(),
    description: expenseDescriptionSchema.optional(),
    category: expenseCategorySchema.optional(),
    date: dateSchema.optional(),
    splitType: splitTypeSchema.optional(),
    splits: z.array(expenseSplitItemSchema).optional(),
  })
  .refine(
    (data) => {
      // If split type is provided as 'exact' or 'percentage', splits must be provided
      if (
        data.splitType &&
        (data.splitType === "exact" || data.splitType === "percentage") &&
        (!data.splits || data.splits.length === 0)
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Splits are required for 'exact' or 'percentage' split types",
      path: ["splits"],
    }
  )
  .refine(
    (data) => {
      // Validate percentage splits sum to 100
      if (data.splitType === "percentage" && data.splits) {
        const totalPercentage = data.splits.reduce(
          (sum, split) => sum + (split.percentage || 0),
          0
        );
        return Math.abs(totalPercentage - 100) < 0.01;
      }
      return true;
    },
    {
      message: "Percentage splits must sum to 100",
      path: ["splits"],
    }
  );

/**
 * Expense ID parameter schema
 */
export const expenseIdParamSchema = z.object({
  expenseId: uuidSchema,
});

/**
 * ============================================================================
 * SETTLEMENT VALIDATION SCHEMAS
 * ============================================================================
 */

/**
 * Create settlement schema
 */
export const createSettlementSchema = z
  .object({
    groupId: uuidSchema,
    fromUserId: uuidSchema,
    toUserId: uuidSchema,
    amount: amountSchema,
  })
  .refine(
    (data) => {
      // From and to users must be different
      return data.fromUserId !== data.toUserId;
    },
    {
      message: "From user and to user must be different",
      path: ["toUserId"],
    }
  );

/**
 * Settlement ID parameter schema
 */
export const settlementIdParamSchema = z.object({
  settlementId: uuidSchema,
});

/**
 * ============================================================================
 * QUERY AND FILTER SCHEMAS
 * ============================================================================
 */

/**
 * Group query parameters
 */
export const groupQuerySchema = z.object({
  search: z.string().trim().optional(),
  currency: currencySchema.optional(),
  ...paginationSchema.shape,
});

/**
 * Expense query parameters
 */
export const expenseQuerySchema = z.object({
  groupId: uuidSchema.optional(),
  payerId: uuidSchema.optional(),
  category: expenseCategorySchema.optional(),
  startDate: dateSchema.optional(),
  endDate: dateSchema.optional(),
  minAmount: amountSchema.optional(),
  maxAmount: amountSchema.optional(),
  sortBy: z.enum(["date", "amount", "createdAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  ...paginationSchema.shape,
});

/**
 * Settlement query parameters
 */
export const settlementQuerySchema = z.object({
  groupId: uuidSchema.optional(),
  fromUserId: uuidSchema.optional(),
  toUserId: uuidSchema.optional(),
  startDate: dateSchema.optional(),
  endDate: dateSchema.optional(),
  ...paginationSchema.shape,
});

/**
 * ============================================================================
 * API RESPONSE VALIDATION SCHEMAS
 * ============================================================================
 */

/**
 * API error schema
 */
export const apiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.record(z.unknown()).optional(),
  statusCode: z.number(),
});

/**
 * API response schema
 */
export const apiResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: apiErrorSchema.optional(),
    message: z.string().optional(),
  });

/**
 * Paginated response schema
 */
export const paginatedResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: z.array(dataSchema).optional(),
    error: apiErrorSchema.optional(),
    message: z.string().optional(),
    pagination: z.object({
      page: z.number(),
      pageSize: z.number(),
      totalCount: z.number(),
      totalPages: z.number(),
      hasMore: z.boolean(),
    }),
  });

/**
 * ============================================================================
 * FORM INPUT VALIDATION SCHEMAS (for React Hook Form)
 * ============================================================================
 */

/**
 * Login form schema
 */
export const loginFormSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

/**
 * Register form schema
 */
export const registerFormSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  }
);

/**
 * Create group form schema
 */
export const createGroupFormSchema = z.object({
  name: groupNameSchema,
  currency: currencySchema,
});

/**
 * Create expense form schema
 */
export const createExpenseFormSchema = z.object({
  amount: amountSchema,
  description: expenseDescriptionSchema,
  category: expenseCategorySchema,
  date: z.string().datetime().or(z.date()).optional(),
  splitType: splitTypeSchema.default("equal"),
});

/**
 * Update profile form schema
 */
export const updateProfileFormSchema = z.object({
  name: nameSchema.optional(),
  image: z.string().url().nullable().optional(),
});

/**
 * ============================================================================
 * TYPE EXPORTS FROM SCHEMAS
 * ============================================================================
 */

/**
 * Type inference from schemas
 */
export type RegisterUserInput = z.infer<typeof registerUserSchema>;
export type LoginUserInput = z.infer<typeof loginUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export type CreateGroupInput = z.infer<typeof createGroupSchema>;
export type UpdateGroupInput = z.infer<typeof updateGroupSchema>;

export type AddGroupMemberInput = z.infer<typeof addGroupMemberSchema>;
export type UpdateGroupMemberRoleInput = z.infer<typeof updateGroupMemberRoleSchema>;

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;

export type CreateSettlementInput = z.infer<typeof createSettlementSchema>;

export type GroupQueryInput = z.infer<typeof groupQuerySchema>;
export type ExpenseQueryInput = z.infer<typeof expenseQuerySchema>;
export type SettlementQueryInput = z.infer<typeof settlementQuerySchema>;

export type LoginFormData = z.infer<typeof loginFormSchema>;
export type RegisterFormData = z.infer<typeof registerFormSchema>;
export type CreateGroupFormData = z.infer<typeof createGroupFormSchema>;
export type CreateExpenseFormData = z.infer<typeof createExpenseFormSchema>;
export type UpdateProfileFormData = z.infer<typeof updateProfileFormSchema>;

/**
 * ============================================================================
 * VALIDATION ERROR UTILITIES
 * ============================================================================
 */

/**
 * Format Zod error for API responses
 */
export function formatZodError(error: z.ZodError): {
  code: string;
  message: string;
  details: Record<string, string[]>;
} {
  const details: Record<string, string[]> = {};

  error.errors.forEach((err) => {
    const path = err.path.join(".") || "general";
    if (!details[path]) {
      details[path] = [];
    }
    details[path].push(err.message);
  });

  return {
    code: "VALIDATION_ERROR",
    message: "Validation failed",
    details,
  };
}

/**
 * Extract first error message from Zod error
 */
export function getFirstErrorMessage(error: z.ZodError): string {
  return error.errors[0]?.message || "Validation failed";
}
