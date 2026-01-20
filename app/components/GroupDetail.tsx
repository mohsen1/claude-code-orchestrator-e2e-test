/**
 * Example component demonstrating Socket.io usage
 * This shows how to use real-time features in a React component
 */

'use client';

import { useGroupSocket } from '@/lib/socket/client';
import { useEffect, useState } from 'react';

interface GroupDetailProps {
  groupId: string;
  currentUserId: string;
}

export function GroupDetail({ groupId, currentUserId }: GroupDetailProps) {
  const {
    isConnected,
    groupData,
    balances,
    expenses,
    members,
    createExpense,
    updateExpense,
    deleteExpense,
    addMember,
    removeMember,
    settleUp,
  } = useGroupSocket(groupId);

  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    category: '',
  });
  const [newMemberEmail, setNewMemberEmail] = useState('');

  // Handle adding an expense
  const handleAddExpense = () => {
    if (!newExpense.description || !newExpense.amount) return;

    createExpense({
      description: newExpense.description,
      amount: parseFloat(newExpense.amount),
      paidBy: currentUserId,
      date: new Date(),
      category: newExpense.category || undefined,
    });

    // Reset form
    setNewExpense({ description: '', amount: '', category: '' });
  };

  // Handle adding a member
  const handleAddMember = () => {
    if (!newMemberEmail) return;

    addMember(newMemberEmail);
    setNewMemberEmail('');
  };

  // Handle settlement
  const handleSettleUp = (toUserId: string, amount: number) => {
    settleUp({
      fromUserId: currentUserId,
      toUserId,
      amount,
    });
  };

  // Get current user's balance
  const currentUserBalance = balances.find((b) => b.userId === currentUserId);

  return (
    <div className="container mx-auto p-4">
      {/* Connection Status */}
      <div className="mb-4">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            isConnected
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {isConnected ? '● Connected' : '○ Disconnected'}
        </span>
      </div>

      {/* Group Information */}
      {groupData && (
        <div className="mb-6">
          <h1 className="text-3xl font-bold">{groupData.name}</h1>
          {groupData.description && (
            <p className="text-gray-600">{groupData.description}</p>
          )}
        </div>
      )}

      {/* Current User Balance */}
      {currentUserBalance && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Your Balance</h2>
          <p
            className={`text-2xl font-bold ${
              currentUserBalance.balance >= 0
                ? 'text-green-600'
                : 'text-red-600'
            }`}
          >
            ${currentUserBalance.balance.toFixed(2)}
          </p>
          {currentUserBalance.balance < 0 && (
            <div className="mt-2">
              <p className="text-sm text-gray-600">You owe:</p>
              <ul className="list-disc list-inside">
                {currentUserBalance.owes.map((owing) => (
                  <li key={owing.userId}>
                    {owing.userName}: ${owing.amount.toFixed(2)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Members */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">Members</h2>
        <div className="space-y-2">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-3 bg-white rounded-lg shadow"
            >
              <div>
                <p className="font-medium">{member.name}</p>
                <p className="text-sm text-gray-500">{member.email}</p>
              </div>
              <div className="text-right">
                <p
                  className={`font-semibold ${
                    member.balance >= 0
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  ${member.balance.toFixed(2)}
                </p>
                {member.balance < 0 && member.id !== currentUserId && (
                  <button
                    onClick={() =>
                      handleSettleUp(member.id, Math.abs(member.balance))
                    }
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Settle Up
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Add Member Form */}
        <div className="mt-4 flex gap-2">
          <input
            type="email"
            value={newMemberEmail}
            onChange={(e) => setNewMemberEmail(e.target.value)}
            placeholder="Enter email to invite"
            className="flex-1 px-3 py-2 border rounded-lg"
          />
          <button
            onClick={handleAddMember}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add Member
          </button>
        </div>
      </div>

      {/* Expenses */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">Expenses</h2>
        <div className="space-y-2">
          {expenses.map((expense) => (
            <div
              key={expense.id}
              className="p-4 bg-white rounded-lg shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{expense.description}</p>
                  <p className="text-sm text-gray-500">
                    Paid by {expense.paidBy.name}
                  </p>
                  <p className="text-sm text-gray-400">
                    {new Date(expense.date).toLocaleDateString()}
                  </p>
                  {expense.category && (
                    <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-gray-100 rounded">
                      {expense.category}
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold">
                    ${expense.amount.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500">
                    Split: ${expense.splitAmount.toFixed(2)} each
                  </p>
                  {expense.paidBy.id === currentUserId && (
                    <button
                      onClick={() => deleteExpense(expense.id)}
                      className="mt-2 text-sm text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Expense Form */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium mb-2">Add Expense</h3>
          <div className="space-y-2">
            <input
              type="text"
              value={newExpense.description}
              onChange={(e) =>
                setNewExpense({ ...newExpense, description: e.target.value })
              }
              placeholder="Description"
              className="w-full px-3 py-2 border rounded-lg"
            />
            <input
              type="number"
              value={newExpense.amount}
              onChange={(e) =>
                setNewExpense({ ...newExpense, amount: e.target.value })
              }
              placeholder="Amount"
              className="w-full px-3 py-2 border rounded-lg"
            />
            <input
              type="text"
              value={newExpense.category}
              onChange={(e) =>
                setNewExpense({ ...newExpense, category: e.target.value })
              }
              placeholder="Category (optional)"
              className="w-full px-3 py-2 border rounded-lg"
            />
            <button
              onClick={handleAddExpense}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Add Expense
            </button>
          </div>
        </div>
      </div>

      {/* All Balances */}
      <div>
        <h2 className="text-xl font-semibold mb-3">All Balances</h2>
        <div className="space-y-2">
          {balances.map((balance) => (
            <div
              key={balance.userId}
              className="p-3 bg-white rounded-lg shadow"
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">{balance.userName}</span>
                <span
                  className={`font-semibold ${
                    balance.balance >= 0
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  ${balance.balance.toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
