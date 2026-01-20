export interface Split {
  user_id: number;
  amount: number;
}

export interface SplitOptions {
  type: 'equal' | 'custom';
  splits?: Split[];
}

/**
 * Calculate expense splits based on the split type
 * @param amount - Total expense amount
 * @param memberIds - Array of user IDs who should split the expense
 * @param options - Split options (equal or custom)
 * @returns Array of splits with user_id and amount
 */
export function calculateSplits(
  amount: number,
  memberIds: number[],
  options: SplitOptions
): Split[] {
  if (options.type === 'equal') {
    return calculateEqualSplits(amount, memberIds);
  } else if (options.type === 'custom') {
    if (!options.splits || options.splits.length === 0) {
      throw new Error('Custom splits must provide splits array');
    }
    return validateCustomSplits(amount, options.splits);
  }

  throw new Error('Invalid split type. Must be "equal" or "custom"');
}

/**
 * Calculate equal splits among all members
 * @param amount - Total expense amount
 * @param memberIds - Array of user IDs
 * @returns Array of equal splits
 */
function calculateEqualSplits(amount: number, memberIds: number[]): Split[] {
  if (memberIds.length === 0) {
    throw new Error('Cannot split expense: no members provided');
  }

  const equalAmount = amount / memberIds.length;

  // Handle floating point precision by distributing remainder
  const splits: Split[] = memberIds.map((user_id, index) => {
    // Round to 2 decimal places
    let splitAmount = Math.round(equalAmount * 100) / 100;

    // Add remainder to the first person to handle rounding errors
    if (index === 0) {
      const totalSplit = splitAmount * memberIds.length;
      const remainder = amount - totalSplit;
      splitAmount += remainder;
      splitAmount = Math.round(splitAmount * 100) / 100;
    }

    return { user_id, amount: splitAmount };
  });

  // Verify total matches
  const totalSplit = splits.reduce((sum, s) => sum + s.amount, 0);
  if (Math.abs(totalSplit - amount) > 0.01) {
    throw new Error(`Split calculation error: ${totalSplit} != ${amount}`);
  }

  return splits;
}

/**
 * Validate custom splits match the total amount
 * @param amount - Total expense amount
 * @param splits - Array of custom splits
 * @returns Validated splits
 */
function validateCustomSplits(amount: number, splits: Split[]): Split[] {
  const totalSplit = splits.reduce((sum, s) => sum + s.amount, 0);

  if (Math.abs(totalSplit - amount) > 0.01) {
    throw new Error(
      `Custom splits total (${totalSplit.toFixed(2)}) must equal expense amount (${amount.toFixed(2)})`
    );
  }

  // Validate all splits have positive amounts
  for (const split of splits) {
    if (split.amount <= 0) {
      throw new Error('All split amounts must be greater than 0');
    }
  }

  return splits;
}

/**
 * Calculate equal split for a single user
 * @param amount - Total expense amount
 * @param memberCount - Number of members splitting
 * @returns Amount per member
 */
export function calculateEqualShare(amount: number, memberCount: number): number {
  if (memberCount <= 0) {
    throw new Error('Member count must be greater than 0');
  }
  return Math.round((amount / memberCount) * 100) / 100;
}
