import { Server as IOServer } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';

export interface SettlementCreatedEventData {
  settlementId: string;
  groupId: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  amount: number;
  currency?: string;
  createdAt: Date;
  status: 'pending' | 'completed' | 'cancelled';
}

export interface SettlementCompletedEventData {
  settlementId: string;
  groupId: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  completedAt: Date;
}

export interface SettlementCancelledEventData {
  settlementId: string;
  groupId: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  cancelledAt: Date;
  cancelledBy: string;
  reason?: string;
}

export interface BalanceUpdatedEventData {
  groupId: string;
  userId: string;
  oldBalance: number;
  newBalance: number;
  updatedAt: Date;
}

/**
 * Emit event when a new settlement is created
 * Notifies both the payer and payee
 */
export function emitSettlementCreated(
  io: IOServer<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
  data: SettlementCreatedEventData
): void {
  const eventPayload = {
    settlementId: data.settlementId,
    groupId: data.groupId,
    fromUserId: data.fromUserId,
    fromUserName: data.fromUserName,
    toUserId: data.toUserId,
    toUserName: data.toUserName,
    amount: data.amount,
    currency: data.currency || 'USD',
    createdAt: data.createdAt,
    status: data.status,
  };

  // Notify the payer (person who owes money)
  io.to(`user:${data.fromUserId}`).emit('settlement:created', eventPayload);

  // Notify the payee (person who will receive money)
  io.to(`user:${data.toUserId}`).emit('settlement:created', eventPayload);
}

/**
 * Emit event when a settlement is completed
 * Notifies both parties that the payment is done
 */
export function emitSettlementCompleted(
  io: IOServer<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
  groupId: string,
  data: SettlementCompletedEventData
): void {
  const eventPayload = {
    settlementId: data.settlementId,
    groupId: data.groupId,
    fromUserId: data.fromUserId,
    toUserId: data.toUserId,
    amount: data.amount,
    completedAt: data.completedAt,
  };

  // Notify the payer
  io.to(`user:${data.fromUserId}`).emit('settlement:completed', eventPayload);

  // Notify the payee
  io.to(`user:${data.toUserId}`).emit('settlement:completed', eventPayload);
}

/**
 * Emit event when a settlement is cancelled
 * Notifies both parties about the cancellation
 */
export function emitSettlementCancelled(
  io: IOServer<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
  groupId: string,
  data: SettlementCancelledEventData
): void {
  const eventPayload = {
    settlementId: data.settlementId,
    groupId: data.groupId,
    fromUserId: data.fromUserId,
    toUserId: data.toUserId,
    amount: data.amount,
    cancelledAt: data.cancelledAt,
    cancelledBy: data.cancelledBy,
    reason: data.reason,
  };

  // Notify the payer
  io.to(`user:${data.fromUserId}`).emit('settlement:cancelled', eventPayload);

  // Notify the payee
  io.to(`user:${data.toUserId}`).emit('settlement:cancelled', eventPayload);
}

/**
 * Emit event when a user's balance is updated
 * Notifies the specific user about their balance change
 */
export function emitBalanceUpdated(
  io: IOServer<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
  groupId: string,
  data: BalanceUpdatedEventData
): void {
  io.to(`user:${data.userId}`).emit('settlement:balance:updated', {
    groupId: data.groupId,
    oldBalance: data.oldBalance,
    newBalance: data.newBalance,
    updatedAt: data.updatedAt,
  });
}

/**
 * Emit event when multiple balances are updated in a group
 * Useful after expense addition or other operations affecting multiple users
 */
export function emitBalancesBulkUpdated(
  io: IOServer<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
  groupId: string,
  balances: Array<{
    userId: string;
    oldBalance: number;
    newBalance: number;
  }>
): void {
  const updatedAt = new Date();

  balances.forEach((balance) => {
    io.to(`user:${balance.userId}`).emit('settlement:balance:updated', {
      groupId,
      oldBalance: balance.oldBalance,
      newBalance: balance.newBalance,
      updatedAt,
    });
  });
}
