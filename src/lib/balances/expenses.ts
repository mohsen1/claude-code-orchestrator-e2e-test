import { Expense, ExpenseSplit, SplitConfig, ExpenseSplitResult } from './types';

/**
 * Generate a unique ID for expense splits
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Calculate how an expense should be split among group members
 */
export function calculateExpenseSplit(
  expense: Expense,
  memberIds: string[],
  splitConfig?: SplitConfig
): ExpenseSplitResult {
  const splits = new Map<string, number>();

  if (splitConfig?.type === 'custom' && splitConfig.splits) {
    // Custom amounts - validate they sum to total
    const totalSplit = splitConfig.splits.reduce((sum, s) => sum + (s.amount || 0), 0);

    if (Math.abs(totalSplit - expense.amount) > 0.01) {
      throw new Error(`Custom splits (${totalSplit.toFixed(2)}) must equal expense amount (${expense.amount.toFixed(2)})`);
    }

    for (const split of splitConfig.splits) {
      if (split.amount && split.amount > 0) {
        splits.set(split.userId, split.amount);
      }
    }
  } else if (splitConfig?.type === 'percentage' && splitConfig.splits) {
    // Percentage-based split
    const totalPercentage = splitConfig.splits.reduce((sum, s) => sum + (s.percentage || 0), 0);

    if (Math.abs(totalPercentage - 100) > 0.01) {
      throw new Error(`Percentages must sum to 100%, got ${totalPercentage.toFixed(2)}%`);
    }

    for (const split of splitConfig.splits) {
      if (split.percentage && split.percentage > 0) {
        const amount = (expense.amount * split.percentage) / 100;
        splits.set(split.userId, Math.round(amount * 100) / 100);
      }
    }

    // Adjust for rounding errors to ensure total matches expense amount
    const calculatedTotal = Array.from(splits.values()).reduce((sum, amt) => sum + amt, 0);
    const difference = Math.round((expense.amount - calculatedTotal) * 100) / 100;

    if (difference !== 0 && splits.size > 0) {
      // Add difference to the largest split
      const largestUserId = Array.from(splits.entries())
        .sort((a, b) => b[1] - a[1])[0][0];
      splits.set(largestUserId, splits.get(largestUserId)! + difference);
    }
  } else {
    // Equal split (default)
    const share = Math.round((expense.amount / memberIds.length) * 100) / 100;

    for (const memberId of memberIds) {
      splits.set(memberId, share);
    }

    // Adjust for rounding errors
    const calculatedTotal = Array.from(splits.values()).reduce((sum, amt) => sum + amt, 0);
    const difference = Math.round((expense.amount - calculatedTotal) * 100) / 100;

    if (difference !== 0 && splits.size > 0) {
      // Add difference to first member
      const firstMemberId = memberIds[0];
      splits.set(firstMemberId, splits.get(firstMemberId)! + difference);
    }
  }

  // The person who paid doesn't owe themselves
  splits.set(expense.paidByUserId, 0);

  return {
    expenseId: expense.id,
    splits,
  };
}

/**
 * Create expense split records for database storage
 */
export function createExpenseSplitRecords(
  expense: Expense,
  memberIds: string[],
  splitConfig?: SplitConfig
): ExpenseSplit[] {
  const splitResult = calculateExpenseSplit(expense, memberIds, splitConfig);
  const splits: ExpenseSplit[] = [];

  for (const [userId, amount] of splitResult.splits.entries()) {
    if (amount > 0) {
      splits.push({
        id: generateId(),
        expenseId: expense.id,
        userId,
        amount,
      });
    }
  }

  return splits;
}

/**
 * Validate split configuration
 */
export function validateSplitConfig(
  config: SplitConfig,
  totalAmount: number,
  memberIds: string[]
): { valid: boolean; error?: string } {
  // Check all user IDs are valid members
  const validUserIds = new Set(memberIds);
  for (const split of config.splits) {
    if (!validUserIds.has(split.userId)) {
      return {
        valid: false,
        error: `User ${split.userId} is not a member of this group`,
      };
    }
  }

  if (config.type === 'custom') {
    const totalSplit = config.splits.reduce((sum, s) => sum + (s.amount || 0), 0);

    if (Math.abs(totalSplit - totalAmount) > 0.01) {
      return {
        valid: false,
        error: `Custom splits (${totalSplit.toFixed(2)}) must equal total amount (${totalAmount.toFixed(2)})`,
      };
    }

    for (const split of config.splits) {
      if (split.amount !== undefined && split.amount < 0) {
        return {
          valid: false,
          error: `Split amounts cannot be negative`,
        };
      }
    }
  } else if (config.type === 'percentage') {
    const totalPercentage = config.splits.reduce((sum, s) => sum + (s.percentage || 0), 0);

    if (Math.abs(totalPercentage - 100) > 0.01) {
      return {
        valid: false,
        error: `Percentages must sum to 100%, got ${totalPercentage.toFixed(2)}%`,
      };
    }

    for (const split of config.splits) {
      if (split.percentage !== undefined && (split.percentage < 0 || split.percentage > 100)) {
        return {
          valid: false,
          error: `Percentages must be between 0 and 100`,
        };
      }
    }
  }

  return { valid: true };
}

/**
 * Get default split configuration for a group
 */
export function getDefaultSplitConfig(memberIds: string[]): SplitConfig {
  return {
    type: 'equal',
    splits: memberIds.map(userId => ({ userId })),
  };
}
