import { prisma } from '../prisma';

export interface CreateExpenseInput {
  groupId: string;
  description: string;
  amount: number;
  date?: Date;
  paidBy: string;
}

export interface UpdateExpenseInput {
  description?: string;
  amount?: number;
  date?: Date;
}

/**
 * Expense model with database operations
 */
export class ExpenseModel {
  /**
   * Create a new expense with equal splits among all group members
   */
  static async create(input: CreateExpenseInput) {
    // Get all group members
    const members = await prisma.groupMember.findMany({
      where: { groupId: input.groupId },
      include: { user: true },
    });

    if (members.length === 0) {
      throw new Error('Cannot create expense: group has no members');
    }

    // Calculate equal split amount
    const splitAmount = input.amount / members.length;

    // Create expense with splits in a transaction
    const expense = await prisma.$transaction(async (tx) => {
      // Create the expense
      const newExpense = await tx.expense.create({
        data: {
          groupId: input.groupId,
          description: input.description,
          amount: input.amount,
          date: input.date || new Date(),
          paidBy: input.paidBy,
        },
      });

      // Create equal splits for all members
      const splits = await Promise.all(
        members.map((member) =>
          tx.expenseSplit.create({
            data: {
              expenseId: newExpense.id,
              userId: member.userId,
              amount: splitAmount,
            },
          })
        )
      );

      return {
        ...newExpense,
        splits,
      };
    });

    return expense;
  }

  /**
   * Get expense by ID with all related data
   */
  static async findById(id: string) {
    return await prisma.expense.findUnique({
      where: { id },
      include: {
        group: {
          include: {
            members: {
              include: { user: true },
            },
          },
        },
        payer: true,
        splits: {
          include: { user: true },
        },
      },
    });
  }

  /**
   * Get all expenses for a group
   */
  static async findByGroup(groupId: string) {
    return await prisma.expense.findMany({
      where: { groupId },
      include: {
        payer: true,
        splits: {
          include: { user: true },
        },
      },
      orderBy: { date: 'desc' },
    });
  }

  /**
   * Get all expenses for a user (either paid by them or split with them)
   */
  static async findByUser(userId: string) {
    return await prisma.expense.findMany({
      where: {
        OR: [
          { paidBy: userId },
          { splits: { some: { userId } } },
        ],
      },
      include: {
        group: true,
        payer: true,
        splits: {
          include: { user: true },
        },
      },
      orderBy: { date: 'desc' },
    });
  }

  /**
   * Update an expense
   */
  static async update(id: string, input: UpdateExpenseInput) {
    const expense = await prisma.expense.findUnique({
      where: { id },
      include: { splits: true },
    });

    if (!expense) {
      throw new Error('Expense not found');
    }

    // If amount is changing, we need to update the splits proportionally
    if (input.amount !== undefined && input.amount !== expense.amount) {
      const ratio = input.amount / expense.amount;

      await prisma.$transaction(async (tx) => {
        // Update expense
        await tx.expense.update({
          where: { id },
          data: {
            description: input.description,
            amount: input.amount,
            date: input.date,
          },
        });

        // Update all splits proportionally
        await Promise.all(
          expense.splits.map((split) =>
            tx.expenseSplit.update({
              where: { id: split.id },
              data: { amount: split.amount * ratio },
            })
          )
        );
      });

      return await this.findById(id);
    } else {
      // Just update other fields
      return await prisma.expense.update({
        where: { id },
        data: input,
        include: {
          payer: true,
          splits: {
            include: { user: true },
          },
        },
      });
    }
  }

  /**
   * Delete an expense
   */
  static async delete(id: string) {
    return await prisma.expense.delete({
      where: { id },
    });
  }

  /**
   * Get total expenses for a group
   */
  static async getTotalForGroup(groupId: string) {
    const result = await prisma.expense.aggregate({
      where: { groupId },
      _sum: { amount: true },
    });

    return result._sum.amount || 0;
  }

  /**
   * Get total expenses paid by a user in a group
   */
  static async getTotalPaidByUserInGroup(groupId: string, userId: string) {
    const result = await prisma.expense.aggregate({
      where: {
        groupId,
        paidBy: userId,
      },
      _sum: { amount: true },
    });

    return result._sum.amount || 0;
  }

  /**
   * Get total share for a user in a group
   */
  static async getTotalShareForUserInGroup(groupId: string, userId: string) {
    const result = await prisma.expenseSplit.aggregate({
      where: {
        expense: { groupId },
        userId,
      },
      _sum: { amount: true },
    });

    return result._sum.amount || 0;
  }
}
