import { Server as SocketIOServer } from 'socket.io';
import { ServerToClientEvents, GroupData, MemberData, BalanceData } from '../events';

interface Database {
  prepare(sql: string): Statement;
  exec(sql: string): void;
}

interface Statement {
  run(...params: any[]): { lastInsertRowid: number };
  get(...params: any[]): any;
  all(...params: any[]): any[];
}

export class GroupHandler {
  constructor(
    private io: SocketIOServer,
    private db: Database
  ) {}

  /**
   * Handle user joining a group room
   */
  handleJoinGroup(socket: any): void {
    socket.on('join_group', async ({ groupId }: { groupId: string }) => {
      try {
        // Verify user is a member of the group
        const userId = (socket as any).userId;
        const member = this.db
          .prepare(
            'SELECT * FROM group_members WHERE group_id = ? AND user_id = ?'
          )
          .get(groupId, userId);

        if (!member) {
          socket.emit('error', {
            message: 'You are not a member of this group',
          });
          return;
        }

        // Join the socket room
        socket.join(groupId);

        // Send current group state to the user
        const groupData = await this.getGroupData(groupId);
        if (groupData) {
          socket.emit('group_updated', groupData);
        }

        // Send current balances
        const balances = await this.calculateBalances(groupId);
        socket.emit('balances_updated', balances);

        console.log(`User ${userId} joined group ${groupId}`);
      } catch (error) {
        console.error('Error joining group:', error);
        socket.emit('error', {
          message: 'Failed to join group',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    });
  }

  /**
   * Handle user leaving a group room
   */
  handleLeaveGroup(socket: any): void {
    socket.on('leave_group', ({ groupId }: { groupId: string }) => {
      try {
        socket.leave(groupId);
        const userId = (socket as any).userId;
        console.log(`User ${userId} left group ${groupId}`);
      } catch (error) {
        console.error('Error leaving group:', error);
        socket.emit('error', {
          message: 'Failed to leave group',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    });
  }

  /**
   * Handle adding a new member to a group
   */
  handleAddMember(socket: any): void {
    socket.on('add_member', async ({ groupId, email }: { groupId: string; email: string }) => {
      try {
        // Verify the user has permission to add members
        const userId = (socket as any).userId;
        const member = this.db
          .prepare(
            'SELECT * FROM group_members WHERE group_id = ? AND user_id = ?'
          )
          .get(groupId, userId);

        if (!member) {
          socket.emit('error', {
            message: 'You are not a member of this group',
          });
          return;
        }

        // Find the user by email
        const user = this.db
          .prepare('SELECT id, name, email FROM users WHERE email = ?')
          .get(email);

        if (!user) {
          socket.emit('error', {
            message: 'User not found',
          });
          return;
        }

        // Check if user is already a member
        const existingMember = this.db
          .prepare(
            'SELECT * FROM group_members WHERE group_id = ? AND user_id = ?'
          )
          .get(groupId, user.id);

        if (existingMember) {
          socket.emit('error', {
            message: 'User is already a member of this group',
          });
          return;
        }

        // Add member to the group
        this.db
          .prepare(
            'INSERT INTO group_members (group_id, user_id, joined_at) VALUES (?, ?, ?)'
          )
          .run(groupId, user.id, new Date().toISOString());

        // Get updated group data
        const groupData = await this.getGroupData(groupId);
        const memberData: MemberData = {
          id: user.id,
          name: user.name,
          email: user.email,
          balance: 0,
        };

        // Notify all members in the group
        this.io.to(groupId).emit('member_added', {
          groupId,
          member: memberData,
        });

        if (groupData) {
          this.io.to(groupId).emit('group_updated', groupData);
        }

        console.log(`User ${user.id} added to group ${groupId}`);
      } catch (error) {
        console.error('Error adding member:', error);
        socket.emit('error', {
          message: 'Failed to add member',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    });
  }

  /**
   * Handle removing a member from a group
   */
  handleRemoveMember(socket: any): void {
    socket.on(
      'remove_member',
      async ({ groupId, memberId }: { groupId: string; memberId: string }) => {
        try {
          // Verify the user has permission
          const userId = (socket as any).userId;
          const member = this.db
            .prepare(
              'SELECT * FROM group_members WHERE group_id = ? AND user_id = ?'
            )
            .get(groupId, userId);

          if (!member) {
            socket.emit('error', {
              message: 'You are not a member of this group',
            });
            return;
          }

          // Remove the member
          this.db
            .prepare('DELETE FROM group_members WHERE group_id = ? AND user_id = ?')
            .run(groupId, memberId);

          // Get updated group data
          const groupData = await this.getGroupData(groupId);

          // Notify all members in the group
          this.io.to(groupId).emit('member_removed', {
            groupId,
            memberId,
          });

          if (groupData) {
            this.io.to(groupId).emit('group_updated', groupData);
          }

          console.log(`Member ${memberId} removed from group ${groupId}`);
        } catch (error) {
          console.error('Error removing member:', error);
          socket.emit('error', {
            message: 'Failed to remove member',
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }
    );
  }

  /**
   * Get complete group data including members
   */
  private async getGroupData(groupId: string): Promise<GroupData | null> {
    try {
      const group = this.db
        .prepare('SELECT * FROM groups WHERE id = ?')
        .get(groupId);

      if (!group) {
        return null;
      }

      const members = this.db
        .prepare(
          `SELECT u.id, u.name, u.email,
           COALESCE(SUM(
             CASE
               WHEN e.paid_by = u.id THEN e.amount
               ELSE -e.amount / (SELECT COUNT(*) FROM group_members WHERE group_id = e.group_id)
             END
           ), 0) as balance
           FROM users u
           INNER JOIN group_members gm ON u.id = gm.user_id
           LEFT JOIN expenses e ON e.group_id = gm.group_id
           WHERE gm.group_id = ?
           GROUP BY u.id`
        )
        .all(groupId);

      return {
        id: group.id,
        name: group.name,
        description: group.description,
        members: members.map((m: any) => ({
          id: m.id,
          name: m.name,
          email: m.email,
          balance: m.balance || 0,
        })),
        createdAt: group.created_at,
      };
    } catch (error) {
      console.error('Error getting group data:', error);
      return null;
    }
  }

  /**
   * Calculate balances for all group members
   */
  async calculateBalances(groupId: string): Promise<BalanceData[]> {
    try {
      const members = this.db
        .prepare(
          `SELECT DISTINCT u.id, u.name
           FROM users u
           INNER JOIN group_members gm ON u.id = gm.user_id
           WHERE gm.group_id = ?`
        )
        .all(groupId);

      const balances: BalanceData[] = [];

      for (const member of members) {
        const paid = this.db
          .prepare(
            'SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE group_id = ? AND paid_by = ?'
          )
          .get(groupId, member.id);

        const totalExpenses = this.db
          .prepare(
            'SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE group_id = ?'
          )
          .get(groupId);

        const memberCount = members.length;
        const share = totalExpenses.total / memberCount;
        const balance = paid.total - share;

        balances.push({
          userId: member.id,
          userName: member.name,
          balance,
          owes: [],
          owedBy: [],
        });
      }

      // Calculate who owes whom
      const debtors = balances.filter((b) => b.balance < 0);
      const creditors = balances.filter((b) => b.balance > 0);

      for (const debtor of debtors) {
        for (const creditor of creditors) {
          if (debtor.balance < 0 && creditor.balance > 0) {
            const amount = Math.min(Math.abs(debtor.balance), creditor.balance);
            if (amount > 0.01) {
              debtor.owes.push({
                userId: creditor.userId,
                userName: creditor.userName,
                amount: Math.round(amount * 100) / 100,
              });
              creditor.owedBy.push({
                userId: debtor.userId,
                userName: debtor.userName,
                amount: Math.round(amount * 100) / 100,
              });
              debtor.balance += amount;
              creditor.balance -= amount;
            }
          }
        }
      }

      return balances;
    } catch (error) {
      console.error('Error calculating balances:', error);
      return [];
    }
  }
}
