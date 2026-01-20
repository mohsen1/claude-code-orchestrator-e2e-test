import { z } from 'zod';

// Settlement Status Enum
export const SettlementStatusEnum = z.enum(['pending', 'completed', 'cancelled']);
export type SettlementStatus = z.infer<typeof SettlementStatusEnum>;

// Database Model Schema
export const SettlementSchema = z.object({
  id: z.string().uuid(),
  groupId: z.string().uuid(),
  fromUserId: z.string().uuid(),
  toUserId: z.string().uuid(),
  amount: z.number().int().positive('Amount must be positive (stored in cents/lowest unit)'),
  status: SettlementStatusEnum.default('pending'),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  completedAt: z.coerce.date().nullable(),
});

// Create Settlement Schema
export const CreateSettlementSchema = SettlementSchema.pick({
  groupId: true,
  fromUserId: true,
  toUserId: true,
  amount: true,
}).refine(
  (data) => data.fromUserId !== data.toUserId,
  'From user and To user must be different'
);

// Update Settlement Status Schema
export const UpdateSettlementSchema = SettlementSchema.pick({
  status: true,
}).refine(
  (data) => data.status !== 'pending',
  'Status cannot be set back to pending'
);

// Settlement Balance Calculation Result
export const UserBalanceSchema = z.object({
  userId: z.string().uuid(),
  userName: z.string(),
  netBalance: z.number().int(), // Can be negative (owes money) or positive (is owed money)
  totalOwed: z.number().int().nonnegative(), // Total amount others owe this user
  totalOwing: z.number().int().nonnegative(), // Total amount this user owes others
});

// Debt Graph Edge (for simplified debt calculation)
export const DebtEdgeSchema = z.object({
  fromUserId: z.string().uuid(),
  fromUserName: z.string(),
  toUserId: z.string().uuid(),
  toUserName: z.string(),
  amount: z.number().int().positive(),
});

// TypeScript Types
export type Settlement = z.infer<typeof SettlementSchema>;
export type CreateSettlement = z.infer<typeof CreateSettlementSchema>;
export type UpdateSettlement = z.infer<typeof UpdateSettlementSchema>;
export type UserBalance = z.infer<typeof UserBalanceSchema>;
export type DebtEdge = z.infer<typeof DebtEdgeSchema>;

// Settlement with Relations Response Type
export type SettlementWithRelations = Settlement & {
  fromUser: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
  toUser: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
  group: {
    id: string;
    name: string;
  };
};

// Group Settlement Summary
export type GroupSettlementSummary = {
  groupId: string;
  groupName: string;
  balances: UserBalance[];
  simplifiedDebts: DebtEdge[];
  totalSettled: number; // Total amount settled (in cents)
  pendingSettlements: number; // Number of pending settlements
};
