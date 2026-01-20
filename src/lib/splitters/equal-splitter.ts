/**
 * Equal Split Strategy
 * Splits expenses equally among all participants
 */

export interface SplitParticipant {
  user_id: number;
  amount_owed: number;
}

export interface SplitResult {
  total_amount: number;
  participant_count: number;
  amount_per_person: number;
  splits: SplitParticipant[];
}

/**
 * Split an expense equally among participants
 * @param totalAmount - The total amount to split
 * @param participantIds - Array of user IDs who should participate in the split
 * @returns SplitResult containing the split details
 */
export function splitEqually(
  totalAmount: number,
  participantIds: number[]
): SplitResult {
  const participantCount = participantIds.length;

  if (participantCount === 0) {
    throw new Error('Cannot split expense with zero participants');
  }

  const amountPerPerson = totalAmount / participantCount;

  const splits: SplitParticipant[] = participantIds.map((user_id) => ({
    user_id,
    amount_owed: amountPerPerson,
  }));

  return {
    total_amount: totalAmount,
    participant_count: participantCount,
    amount_per_person: amountPerPerson,
    splits,
  };
}

/**
 * Calculate the amount each person owes in an equal split
 * @param totalAmount - The total amount to split
 * @param participantCount - The number of participants
 * @returns The amount each person owes
 */
export function calculateAmountPerPerson(totalAmount: number, participantCount: number): number {
  if (participantCount <= 0) {
    throw new Error('Participant count must be greater than zero');
  }

  return totalAmount / participantCount;
}

/**
 * Validate if an equal split is possible
 * @param totalAmount - The total amount to split
 * @param participantIds - Array of user IDs who should participate in the split
 * @returns true if the split is valid, false otherwise
 */
export function validateEqualSplit(totalAmount: number, participantIds: number[]): boolean {
  return totalAmount > 0 && participantIds.length > 0;
}

/**
 * Format a split result for display
 * @param result - The split result to format
 * @returns A formatted string representation of the split
 */
export function formatSplitResult(result: SplitResult): string {
  const lines = [
    `Total Amount: $${result.total_amount.toFixed(2)}`,
    `Participants: ${result.participant_count}`,
    `Amount per Person: $${result.amount_per_person.toFixed(2)}`,
    '',
    'Splits:',
  ];

  result.splits.forEach((split) => {
    lines.push(`  User ${split.user_id}: $${split.amount_owed.toFixed(2)}`);
  });

  return lines.join('\n');
}

/**
 * Calculate what a specific user owes in an equal split
 * @param totalAmount - The total amount to split
 * @param participantCount - The number of participants
 * @param userId - The user ID to calculate for (not used in equal split, but kept for API consistency)
 * @returns The amount the user owes
 */
export function calculateUserShare(
  totalAmount: number,
  participantCount: number,
  userId: number
): number {
  // In equal split, everyone pays the same regardless of user ID
  return calculateAmountPerPerson(totalAmount, participantCount);
}

/**
 * Create expense participants from split result
 * This formats the data for database insertion
 * @param expenseId - The expense ID to link participants to
 * @param splitResult - The split result containing participant data
 * @returns Array of participant data ready for database insertion
 */
export function createParticipantsFromSplit(
  expenseId: number,
  splitResult: SplitResult
): Array<{ expense_id: number; user_id: number; amount_owed: number }> {
  return splitResult.splits.map((split) => ({
    expense_id: expenseId,
    user_id: split.user_id,
    amount_owed: split.amount_owed,
  }));
}
