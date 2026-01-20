import { prisma } from '../prisma';

export interface CreateExpenseSplitInput {
  expenseId: string;
  userId: string;
  amount: number;
}

export interface UpdateExpenseSplitInput {
  amount: number;
}

/**
 * ExpenseSplit model with database operations
 */
export class ExpenseSplitModel {
  /**
   * Create a new expense split
   */
  static async create(input: CreateExpenseSplitInput) {
    return await prisma.expenseSplit.create({
      data: input,
      include: {
        expense: {
          include: {
            group: true,
            payer: true,
          },
        },
        user: true,
      },
    });
  }

  /**
   * Get expense split by ID
   */
  static async findById(id: string) {
    return await prisma.expenseSplit.findUnique({
      where: { id },
      include: {
        expense: {
          include: {
            group: true,
            payer: true,
          },
        },
        user: true,
      },
    });
  }

  /**
   * Get all splits for an expense
   */
  static async findByExpense(expenseId: string) {
    return await prisma.expenseSplit.findMany({
      where: { expenseId },
      include: { user: true },
      orderBy: { amount: 'desc' },
    });
  }

  /**
   * Get all splits for a user
   */
  static async findByUser(userId: string) {
    return await prisma.expenseSplit.findMany({
      where: { userId },
      include: {
        expense: {
          include: {
            group: true,
            payer: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get splits for a user in a specific group
   */
  static async findByUserAndGroup(userId: string, groupId: string) {
    return await prisma.expenseSplit.findMany({
      where: {
        userId,
        expense: { groupId },
      },
      include: {
        expense: {
          include: {
            group: true,
            payer: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Update an expense split
   */
  static async update(id: string, input: UpdateExpenseSplitInput) {
    // Get the expense to verify total splits don't exceed expense amount
    const split = await prisma.expenseSplit.findUnique({
      where: { id },
      include: { expense: true },
    });

    if (!split) {
      throw new Error('Expense split not found');
    }

    // Get all other splits for this expense
    const otherSplits = await prisma.expenseSplit.findMany({
      where: {
        expenseId: split.expenseId,
        id: { not: id },
      },
    });

    const otherSplitsTotal = otherSplits.reduce((sum, s) => sum + s.amount, 0);
    const newTotal = otherSplitsTotal + input.amount;

    if (Math.abs(newTotal - split.expense.amount) > 0.01) {
      throw new Error(
        `Split amount (${input.amount}) would make total (${newTotal}) not equal to expense amount (${split.expense.amount})`
      );
    }

    return await prisma.expenseSplit.update({
      where: { id },
      data: input,
      include: {
        expense: {
          include: {
            group: true,
            payer: true,
          },
        },
        user: true,
      },
    });
  }

  /**
   * Delete an expense split
   */
  static async delete(id: string) {
    return await prisma.expenseSplit.delete({
      where: { id },
    });
  }

  /**
   * Verify that splits add up to expense amount
   */
  static async verifySplits(expenseId: string): Promise<boolean> {
    const splits = await prisma.expenseSplit.findMany({
      where: { expenseId },
    });

    const expense = await prisma.expense.findUnique({
      where: { id: expenseId },
    });

    if (!expense) {
      throw new Error('Expense not found');
    }

    const splitsTotal = splits.reduce((sum, split) => sum + split.amount, 0);

    // Allow small floating point differences
    return Math.abs(splitsTotal - expense.amount) < 0.01;
  }

  /**
   * Get summary of splits for an expense
   */
  static async getExpenseSplitSummary(expenseId: string) {
    const splits = await this.findByExpense(expenseId);

    return {
      totalSplits: splits.length,
      totalAmount: splits.reduce((sum, split) => sum + split.amount, 0),
      splits: splits.map((split) => ({
        id: split.id,
        userId: split.userId,
        userName: split.user.name,
        amount: split.amount,
        percentage: splits.length > 0 ? (split.amount / splits.reduce((sum, s) => sum + s.amount, 0)) * 100 : 0,
      })),
    };
  }
}
