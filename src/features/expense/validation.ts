import {
  Expense,
  ExpenseCreateInput,
  ExpenseUpdateInput,
  ExpenseGroupCreateInput,
  ExpenseGroupUpdateInput,
  ExpenseFilter,
  SplitType,
  ValidationResult,
  ValidationError,
} from './types';

// Utility function to create validation errors
const createError = (field: string, message: string, code?: string): ValidationError => ({
  field,
  message,
  code,
});

// Validate expense amount
export const validateAmount = (amount: number): ValidationError | null => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return createError('amount', 'Amount must be a valid number', 'INVALID_TYPE');
  }
  if (amount <= 0) {
    return createError('amount', 'Amount must be greater than 0', 'INVALID_VALUE');
  }
  if (amount > Number.MAX_SAFE_INTEGER) {
    return createError('amount', 'Amount exceeds maximum allowed value', 'MAX_VALUE_EXCEEDED');
  }
  if (!Number.isFinite(amount)) {
    return createError('amount', 'Amount must be a finite number', 'NOT_FINITE');
  }
  // Check for reasonable decimal places (max 2 for currency)
  const decimalPlaces = (amount.toString().split('.')[1] || '').length;
  if (decimalPlaces > 2) {
    return createError('amount', 'Amount cannot have more than 2 decimal places', 'TOO_MANY_DECIMALS');
  }
  return null;
};

// Validate expense description
export const validateDescription = (description: string): ValidationError | null => {
  if (typeof description !== 'string') {
    return createError('description', 'Description must be a string', 'INVALID_TYPE');
  }
  if (description.trim().length === 0) {
    return createError('description', 'Description cannot be empty', 'EMPTY_VALUE');
  }
  if (description.length > 500) {
    return createError('description', 'Description cannot exceed 500 characters', 'TOO_LONG');
  }
  return null;
};

// Validate user ID
export const validateUserId = (userId: string, fieldName: string = 'userId'): ValidationError | null => {
  if (typeof userId !== 'string') {
    return createError(fieldName, 'User ID must be a string', 'INVALID_TYPE');
  }
  if (userId.trim().length === 0) {
    return createError(fieldName, 'User ID cannot be empty', 'EMPTY_VALUE');
  }
  return null;
};

// Validate group ID
export const validateGroupId = (groupId: string): ValidationError | null => {
  if (typeof groupId !== 'string') {
    return createError('groupId', 'Group ID must be a string', 'INVALID_TYPE');
  }
  if (groupId.trim().length === 0) {
    return createError('groupId', 'Group ID cannot be empty', 'EMPTY_VALUE');
  }
  return null;
};

// Validate split type
export const validateSplitType = (splitType: string): ValidationError | null => {
  const validSplitTypes: SplitType[] = ['equal', 'exact', 'percentage', 'custom'];
  if (!validSplitTypes.includes(splitType as SplitType)) {
    return createError(
      'splitType',
      `Split type must be one of: ${validSplitTypes.join(', ')}`,
      'INVALID_VALUE'
    );
  }
  return null;
};

// Validate expense splits
export const validateSplits = (
  splits: Array<{ userId: string; amount?: number; percentage?: number }>,
  splitType: SplitType,
  totalAmount: number
): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!Array.isArray(splits) || splits.length === 0) {
    errors.push(createError('splits', 'At least one split must be provided', 'EMPTY_SPLITS'));
    return errors;
  }

  // Check for duplicate user IDs
  const userIds = splits.map((s) => s.userId);
  const uniqueIds = new Set(userIds);
  if (userIds.length !== uniqueIds.size) {
    errors.push(createError('splits', 'Duplicate user IDs found in splits', 'DUPLICATE_USERS'));
  }

  // Validate each split based on split type
  splits.forEach((split, index) => {
    const prefix = `splits[${index}]`;

    // Validate user ID
    const userIdError = validateUserId(split.userId, `${prefix}.userId`);
    if (userIdError) errors.push(userIdError);

    if (splitType === 'exact') {
      if (split.amount === undefined || split.amount === null) {
        errors.push(createError(prefix, 'Amount is required for exact splits', 'MISSING_AMOUNT'));
      } else {
        const amountError = validateAmount(split.amount);
        if (amountError) {
          errors.push({ ...amountError, field: `${prefix}.amount` });
        }
      }
    }

    if (splitType === 'percentage') {
      if (split.percentage === undefined || split.percentage === null) {
        errors.push(createError(prefix, 'Percentage is required for percentage splits', 'MISSING_PERCENTAGE'));
      } else if (typeof split.percentage !== 'number' || split.percentage < 0 || split.percentage > 100) {
        errors.push(
          createError(
            `${prefix}.percentage`,
            'Percentage must be between 0 and 100',
            'INVALID_PERCENTAGE'
          )
        );
      }
    }

    if (splitType === 'custom') {
      if (split.amount !== undefined && split.amount !== null) {
        const amountError = validateAmount(split.amount);
        if (amountError) {
          errors.push({ ...amountError, field: `${prefix}.amount` });
        }
      }
    }
  });

  // Validate totals
  if (splitType === 'percentage') {
    const totalPercentage = splits.reduce((sum, split) => sum + (split.percentage || 0), 0);
    if (Math.abs(totalPercentage - 100) > 0.01) {
      errors.push(
        createError('splits', `Total percentage must equal 100% (current: ${totalPercentage.toFixed(2)}%)`, 'INVALID_TOTAL')
      );
    }
  }

  if (splitType === 'exact') {
    const totalSplitAmount = splits.reduce((sum, split) => sum + (split.amount || 0), 0);
    if (Math.abs(totalSplitAmount - totalAmount) > 0.01) {
      errors.push(
        createError(
          'splits',
          `Total split amount (${totalSplitAmount.toFixed(2)}) must equal expense amount (${totalAmount.toFixed(2)})`,
          'AMOUNT_MISMATCH'
        )
      );
    }
  }

  return errors;
};

// Validate expense category
export const validateCategory = (category: string | undefined): ValidationError | null => {
  if (category === undefined || category === null) {
    return null; // Category is optional
  }
  if (typeof category !== 'string') {
    return createError('category', 'Category must be a string', 'INVALID_TYPE');
  }
  if (category.length > 100) {
    return createError('category', 'Category cannot exceed 100 characters', 'TOO_LONG');
  }
  return null;
};

// Validate date
export const validateDate = (date: Date | undefined): ValidationError | null => {
  if (date === undefined || date === null) {
    return null; // Date is optional
  }
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return createError('date', 'Invalid date', 'INVALID_DATE');
  }
  // Check if date is not in the future (allow small buffer for timezone differences)
  const now = new Date();
  const oneDayInMs = 24 * 60 * 60 * 1000;
  if (date.getTime() > now.getTime() + oneDayInMs) {
    return createError('date', 'Date cannot be in the future', 'FUTURE_DATE');
  }
  // Check if date is not too far in the past
  const maxAge = 100 * 365 * oneDayInMs; // 100 years
  if (date.getTime() < now.getTime() - maxAge) {
    return createError('date', 'Date is too far in the past', 'DATE_TOO_OLD');
  }
  return null;
};

// Validate group name
export const validateGroupName = (name: string): ValidationError | null => {
  if (typeof name !== 'string') {
    return createError('name', 'Name must be a string', 'INVALID_TYPE');
  }
  if (name.trim().length === 0) {
    return createError('name', 'Name cannot be empty', 'EMPTY_VALUE');
  }
  if (name.length > 200) {
    return createError('name', 'Name cannot exceed 200 characters', 'TOO_LONG');
  }
  return null;
};

// Validate group description
export const validateGroupDescription = (description: string | undefined): ValidationError | null => {
  if (description === undefined || description === null) {
    return null; // Description is optional
  }
  if (typeof description !== 'string') {
    return createError('description', 'Description must be a string', 'INVALID_TYPE');
  }
  if (description.length > 1000) {
    return createError('description', 'Description cannot exceed 1000 characters', 'TOO_LONG');
  }
  return null;
};

// Validate currency code
export const validateCurrency = (currency: string): ValidationError | null => {
  if (typeof currency !== 'string') {
    return createError('currency', 'Currency must be a string', 'INVALID_TYPE');
  }
  // ISO 4217 currency code format (3 letters)
  const currencyRegex = /^[A-Z]{3}$/;
  if (!currencyRegex.test(currency)) {
    return createError('currency', 'Currency must be a valid ISO 4217 code (e.g., USD, EUR)', 'INVALID_CURRENCY');
  }
  return null;
};

// Validate expense create input
export const validateExpenseCreateInput = (input: ExpenseCreateInput): ValidationResult<ExpenseCreateInput> => {
  const errors: ValidationError[] = [];

  // Validate required fields
  const groupIdError = validateGroupId(input.groupId);
  if (groupIdError) errors.push(groupIdError);

  const amountError = validateAmount(input.amount);
  if (amountError) errors.push(amountError);

  const descriptionError = validateDescription(input.description);
  if (descriptionError) errors.push(descriptionError);

  const paidByError = validateUserId(input.paidBy, 'paidBy');
  if (paidByError) errors.push(paidByError);

  const splitTypeError = validateSplitType(input.splitType);
  if (splitTypeError) errors.push(splitTypeError);

  // Validate splits
  const splitErrors = validateSplits(input.splits, input.splitType, input.amount);
  errors.push(...splitErrors);

  // Validate optional fields
  const categoryError = validateCategory(input.category);
  if (categoryError) errors.push(categoryError);

  const dateError = validateDate(input.date);
  if (dateError) errors.push(dateError);

  return {
    isValid: errors.length === 0,
    errors,
    data: input,
  };
};

// Validate expense update input
export const validateExpenseUpdateInput = (input: ExpenseUpdateInput): ValidationResult<ExpenseUpdateInput> => {
  const errors: ValidationError[] = [];

  // At least one field must be provided
  if (Object.keys(input).length === 0) {
    errors.push(createError('input', 'At least one field must be provided for update', 'EMPTY_UPDATE'));
  }

  // Validate amount if provided
  if (input.amount !== undefined) {
    const amountError = validateAmount(input.amount);
    if (amountError) errors.push(amountError);
  }

  // Validate description if provided
  if (input.description !== undefined) {
    const descriptionError = validateDescription(input.description);
    if (descriptionError) errors.push(descriptionError);
  }

  // Validate splitType if provided
  if (input.splitType !== undefined) {
    const splitTypeError = validateSplitType(input.splitType);
    if (splitTypeError) errors.push(splitTypeError);
  }

  // Validate splits if provided
  if (input.splits !== undefined) {
    // We need total amount and split type to validate splits properly
    // This will be validated at the service layer where we have the full context
    if (!Array.isArray(input.splits) || input.splits.length === 0) {
      errors.push(createError('splits', 'At least one split must be provided', 'EMPTY_SPLITS'));
    }
  }

  // Validate category if provided
  if (input.category !== undefined) {
    const categoryError = validateCategory(input.category);
    if (categoryError) errors.push(categoryError);
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: input,
  };
};

// Validate expense group create input
export const validateExpenseGroupCreateInput = (
  input: ExpenseGroupCreateInput
): ValidationResult<ExpenseGroupCreateInput> => {
  const errors: ValidationError[] = [];

  // Validate name
  const nameError = validateGroupName(input.name);
  if (nameError) errors.push(nameError);

  // Validate description
  const descriptionError = validateGroupDescription(input.description);
  if (descriptionError) errors.push(descriptionError);

  // Validate currency if provided
  if (input.currency !== undefined) {
    const currencyError = validateCurrency(input.currency);
    if (currencyError) errors.push(currencyError);
  }

  // Validate member IDs
  if (!Array.isArray(input.memberIds)) {
    errors.push(createError('memberIds', 'Member IDs must be an array', 'INVALID_TYPE'));
  } else if (input.memberIds.length === 0) {
    errors.push(createError('memberIds', 'At least one member must be specified', 'EMPTY_MEMBERS'));
  } else {
    input.memberIds.forEach((memberId, index) => {
      const memberError = validateUserId(memberId, `memberIds[${index}]`);
      if (memberError) errors.push(memberError);
    });

    // Check for duplicates
    const uniqueIds = new Set(input.memberIds);
    if (uniqueIds.size !== input.memberIds.length) {
      errors.push(createError('memberIds', 'Duplicate member IDs found', 'DUPLICATE_MEMBERS'));
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: input,
  };
};

// Validate expense group update input
export const validateExpenseGroupUpdateInput = (
  input: ExpenseGroupUpdateInput
): ValidationResult<ExpenseGroupUpdateInput> => {
  const errors: ValidationError[] = [];

  // At least one field must be provided
  if (Object.keys(input).length === 0) {
    errors.push(createError('input', 'At least one field must be provided for update', 'EMPTY_UPDATE'));
  }

  // Validate name if provided
  if (input.name !== undefined) {
    const nameError = validateGroupName(input.name);
    if (nameError) errors.push(nameError);
  }

  // Validate description if provided
  if (input.description !== undefined) {
    const descriptionError = validateGroupDescription(input.description);
    if (descriptionError) errors.push(descriptionError);
  }

  // Validate currency if provided
  if (input.currency !== undefined) {
    const currencyError = validateCurrency(input.currency);
    if (currencyError) errors.push(currencyError);
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: input,
  };
};

// Validate expense filter
export const validateExpenseFilter = (filter: ExpenseFilter): ValidationResult<ExpenseFilter> => {
  const errors: ValidationError[] = [];

  // Validate groupId if provided
  if (filter.groupId !== undefined) {
    const groupIdError = validateGroupId(filter.groupId);
    if (groupIdError) errors.push(groupIdError);
  }

  // Validate userId if provided
  if (filter.userId !== undefined) {
    const userIdError = validateUserId(filter.userId, 'userId');
    if (userIdError) errors.push(userIdError);
  }

  // Validate paidBy if provided
  if (filter.paidBy !== undefined) {
    const paidByError = validateUserId(filter.paidBy, 'paidBy');
    if (paidByError) errors.push(paidByError);
  }

  // Validate category if provided
  if (filter.category !== undefined) {
    const categoryError = validateCategory(filter.category);
    if (categoryError) errors.push(categoryError);
  }

  // Validate dates if provided
  if (filter.startDate !== undefined) {
    const startDateError = validateDate(filter.startDate);
    if (startDateError) errors.push({ ...startDateError, field: 'startDate' });
  }

  if (filter.endDate !== undefined) {
    const endDateError = validateDate(filter.endDate);
    if (endDateError) errors.push({ ...endDateError, field: 'endDate' });
  }

  // Validate date range
  if (filter.startDate && filter.endDate) {
    if (filter.startDate > filter.endDate) {
      errors.push(createError('endDate', 'End date must be after start date', 'INVALID_DATE_RANGE'));
    }
  }

  // Validate amount range if provided
  if (filter.minAmount !== undefined) {
    if (typeof filter.minAmount !== 'number' || filter.minAmount < 0) {
      errors.push(createError('minAmount', 'Minimum amount must be a non-negative number', 'INVALID_VALUE'));
    }
  }

  if (filter.maxAmount !== undefined) {
    if (typeof filter.maxAmount !== 'number' || filter.maxAmount < 0) {
      errors.push(createError('maxAmount', 'Maximum amount must be a non-negative number', 'INVALID_VALUE'));
    }
  }

  // Validate amount range
  if (filter.minAmount !== undefined && filter.maxAmount !== undefined) {
    if (filter.minAmount > filter.maxAmount) {
      errors.push(
        createError('maxAmount', 'Maximum amount must be greater than or equal to minimum amount', 'INVALID_RANGE')
      );
    }
  }

  // Validate splitType if provided
  if (filter.splitType !== undefined) {
    const splitTypeError = validateSplitType(filter.splitType);
    if (splitTypeError) errors.push(splitTypeError);
  }

  // Validate search if provided
  if (filter.search !== undefined) {
    if (typeof filter.search !== 'string') {
      errors.push(createError('search', 'Search must be a string', 'INVALID_TYPE'));
    } else if (filter.search.length > 200) {
      errors.push(createError('search', 'Search cannot exceed 200 characters', 'TOO_LONG'));
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: filter,
  };
};

// Helper function to format validation errors for user display
export const formatValidationErrors = (errors: ValidationError[]): string => {
  return errors
    .map((error) => {
      const field = error.field ? `${error.field}: ` : '';
      return `${field}${error.message}`;
    })
    .join('\n');
};

// Helper to check if a validation result is valid
export const isValid = <T>(result: ValidationResult<T>): result is ValidationResult<T> & { data: T } => {
  return result.isValid;
};
