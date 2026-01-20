import { prisma } from '../prisma';

export interface UserBalance {
  userId: string;
  userName: string | null;
  userImage: string | null;
  totalPaid: number;
  totalShare: number;
  balance: number; // Positive = owed money, Negative = owes money
}

export interface GroupBalanceSummary {
  groupId: string;
  groupName: string;
  totalExpenses: number;
  balances: UserBalance[];
  debts: DebtRelationship[];
}

export interface DebtRelationship {
  fromUserId: string;
  fromUserName: string | null;
  toUserId: string;
  toUserName: string | null;
  amount: number;
}

/**
 * Balance calculation utilities
 */
export class BalanceModel {
  /**
   * Calculate balances for all members of a group
   */
  static async calculateGroupBalances(groupId: string): Promise<UserBalance[]> {
    // Get all group members
    const members = await prisma.groupMember.findMany({
      where: { groupId },
      include: { user: true },
    });

    // Calculate balances for each member
    const balances: UserBalance[] = await Promise.all(
      members.map(async (member) => {
        // Total amount this user paid
        const paidResult = await prisma.expense.aggregate({
          where: {
            groupId,
            paidBy: member.userId,
          },
          _sum: { amount: true },
        });

        const totalPaid = paidResult._sum.amount || 0;

        // Total amount this user owes (their share)
        const shareResult = await prisma.expenseSplit.aggregate({
          where: {
            expense: { groupId },
            userId: member.userId,
          },
          _sum: { amount: true },
        });

        const totalShare = shareResult._sum.amount || 0;

        // Balance: positive means they're owed money, negative means they owe
        const balance = totalPaid - totalShare;

        return {
          userId: member.userId,
          userName: member.user.name,
          userImage: member.user.image,
          totalPaid,
          totalShare,
          balance,
        };
      })
    );

    // Sort by balance (highest first - people owed money)
    return balances.sort((a, b) => b.balance - a.balance);
  }

  /**
   * Calculate simplified debts for a group (minimize number of transactions)
   */
  static async calculateGroupDebts(groupId: string): Promise<DebtRelationship[]> {
    const balances = await this.calculateGroupBalances(groupId);

    // Separate into creditors (positive balance) and debtors (negative balance)
    const creditors = balances.filter((b) => b.balance > 0.01);
    const debtors = balances.filter((b) => b.balance < -0.01);

    const debts: DebtRelationship[] = [];

    // Use two pointers to match creditors with debtors
    let creditorIdx = 0;
    let debtorIdx = 0;

    while (creditorIdx < creditors.length && debtorIdx < debtors.length) {
      const creditor = creditors[creditorIdx];
      const debtor = debtors[debtorIdx];

      // The amount to settle is the minimum of what creditor is owed and debtor owes
      const amount = Math.min(creditor.balance, Math.abs(debtor.balance));

      if (amount > 0.01) {
        debts.push({
          fromUserId: debtor.userId,
          fromUserName: debtor.userName,
          toUserId: creditor.userId,
          toUserName: creditor.userName,
          amount: Math.round(amount * 100) / 100, // Round to 2 decimal places
        });
      }

      // Update balances
      creditor.balance -= amount;
      debtor.balance += amount;

      // Move pointers if balance is settled
      if (creditor.balance < 0.01) creditorIdx++;
      if (debtor.balance > -0.01) debtorIdx++;
    }

    return debts;
  }

  /**
   * Get complete balance summary for a group
   */
  static async getGroupBalanceSummary(groupId: string): Promise<GroupBalanceSummary> {
    const group = await prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      throw new Error('Group not found');
    }

    // Get total expenses for the group
    const expenseResult = await prisma.expense.aggregate({
      where: { groupId },
      _sum: { amount: true },
    });

    const totalExpenses = expenseResult._sum.amount || 0;

    // Calculate balances and debts
    const balances = await this.calculateGroupBalances(groupId);
    const debts = await this.calculateGroupDebts(groupId);

    return {
      groupId: group.id,
      groupName: group.name,
      totalExpenses,
      balances,
      debts,
    };
  }

  /**
   * Get balance between two specific users in a group
   */
  static async getUserBalanceInGroup(
    groupId: string,
    userId: string
  ): Promise<UserBalance | null> {
    const balances = await this.calculateGroupBalances(groupId);
    return balances.find((b) => b.userId === userId) || null;
  }

  /**
   * Calculate overall balances across all groups for a user
   */
  static async calculateUserOverallBalances(userId: string) {
    // Get all groups the user is a member of
    const memberships = await prisma.groupMember.findMany({
      where: { userId },
      include: { group: true },
    });

    const groupBalances = await Promise.all(
      memberships.map(async (membership) => {
        const balance = await this.getUserBalanceInGroup(
          membership.groupId,
          userId
        );

        return {
          groupId: membership.groupId,
          groupName: membership.group.name,
          balance: balance?.balance || 0,
          totalPaid: balance?.totalPaid || 0,
          totalShare: balance?.totalShare || 0,
        };
      })
    );

    // Calculate totals
    const totalPaid = groupBalances.reduce((sum, g) => sum + g.totalPaid, 0);
    const totalShare = groupBalances.reduce((sum, g) => sum + g.totalShare, 0);
    const overallBalance = totalPaid - totalShare;

    return {
      userId,
      groupBalances,
      totalPaid,
      totalShare,
      overallBalance,
    };
  }

  /**
   * Get users who owe money to a specific user
   */
  static async getDebtsForUser(groupId: string, userId: string): Promise<DebtRelationship[]> {
    const debts = await this.calculateGroupDebts(groupId);
    return debts.filter((d) => d.toUserId === userId);
  }

  /**
   * Get users a specific user owes money to
   */
  static async getLiabilitiesForUser(groupId: string, userId: string): Promise<DebtRelationship[]> {
    const debts = await this.calculateGroupDebts(groupId);
    return debts.filter((d) => d.fromUserId === userId);
  }

  /**
   * Check if a group's balances are settled
   */
  static async isGroupSettled(groupId: string): Promise<boolean> {
    const balances = await this.calculateGroupBalances(groupId);
    return balances.every((b) => Math.abs(b.balance) < 0.01);
  }

  /**
   * Get settlement status for a user in a group
   */
  static async getUserSettlementStatus(groupId: string, userId: string) {
    const debts = await this.calculateGroupDebts(groupId);

    const owes = debts
      .filter((d) => d.fromUserId === userId)
      .reduce((sum, d) => sum + d.amount, 0);

    const owed = debts
      .filter((d) => d.toUserId === userId)
      .reduce((sum, d) => sum + d.amount, 0);

    return {
      owes: Math.round(owes * 100) / 100,
      owed: Math.round(owed * 100) / 100,
      isSettled: Math.abs(owes - owed) < 0.01,
    };
  }
}
