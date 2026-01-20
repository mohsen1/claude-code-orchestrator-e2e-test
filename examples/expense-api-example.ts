/**
 * Example usage of the Expense API
 * This file demonstrates how to use the expense CRUD endpoints
 */

import {
  createExpense,
  getExpenseById,
  getExpensesByGroupId,
  getExpensesByUserId,
  updateExpense,
  deleteExpense,
  updateExpenseSplits,
  calculateGroupBalances,
  getUserBalance,
} from '../lib/db/expenses';
import {
  createUser,
  createGroup,
  addMemberToGroup,
} from '../lib/db/users'; // Assuming these exist

// Example 1: Creating an expense
async function createExampleExpense() {
  const expense = createExpense({
    group_id: 'group-123',
    description: 'Dinner at Mario\'s Restaurant',
    amount: 150.00,
    currency: 'USD',
    paid_by: 'user-456',
    category: 'Food & Dining',
    date: new Date().toISOString(),
    split_with: ['user-456', 'user-789', 'user-101'],
  });

  console.log('Created expense:', expense);
  return expense;
}

// Example 2: Fetching expenses for a group
async function fetchGroupExpenses(groupId: string) {
  const expenses = getExpensesByGroupId(groupId);

  console.log(`Found ${expenses.length} expenses for group ${groupId}`);
  expenses.forEach(expense => {
    console.log(`- ${expense.description}: $${expense.amount} paid by ${expense.paid_by_user?.name}`);
  });

  return expenses;
}

// Example 3: Fetching a single expense
async function fetchExpenseDetails(expenseId: string) {
  const expense = getExpenseById(expenseId);

  if (!expense) {
    console.log('Expense not found');
    return null;
  }

  console.log('Expense Details:');
  console.log(`Description: ${expense.description}`);
  console.log(`Amount: ${expense.currency} ${expense.amount}`);
  console.log(`Paid by: ${expense.paid_by_user?.name}`);
  console.log(`Splits:`);
  expense.splits?.forEach(split => {
    console.log(`  - ${split.user?.name}: $${split.amount}`);
  });

  return expense;
}

// Example 4: Updating an expense
async function updateExampleExpense(expenseId: string) {
  const updatedExpense = updateExpense(expenseId, {
    description: 'Updated: Dinner at Mario\'s Restaurant',
    amount: 180.00,
  });

  if (updatedExpense) {
    console.log('Expense updated successfully:', updatedExpense);
  } else {
    console.log('Failed to update expense');
  }

  return updatedExpense;
}

// Example 5: Updating expense splits
async function updateExpenseSplit(expenseId: string) {
  const success = updateExpenseSplits(expenseId, [
    'user-456',
    'user-789',
    'user-101',
    'user-202', // Adding another person
  ]);

  if (success) {
    console.log('Expense splits updated successfully');
    const updatedExpense = getExpenseById(expenseId);
    console.log('New splits:', updatedExpense?.splits);
  }
}

// Example 6: Calculating group balances
async function showGroupBalances(groupId: string) {
  const balances = calculateGroupBalances(groupId);

  console.log('Group Balances:');
  Object.entries(balances).forEach(([userId, balance]) => {
    const status = balance > 0 ? 'is owed' : 'owes';
    console.log(`User ${userId} ${status} $${Math.abs(balance).toFixed(2)}`);
  });
}

// Example 7: Getting user's total balance
async function showUserBalance(userId: string) {
  const balance = getUserBalance(userId);

  if (balance > 0) {
    console.log(`User is owed $${balance.toFixed(2)} in total`);
  } else if (balance < 0) {
    console.log(`User owes $${Math.abs(balance).toFixed(2)} in total`);
  } else {
    console.log('User is all settled up!');
  }
}

// Example 8: Deleting an expense
async function deleteExampleExpense(expenseId: string) {
  const success = deleteExpense(expenseId);

  if (success) {
    console.log('Expense deleted successfully');
  } else {
    console.log('Failed to delete expense');
  }
}

// Example 9: Complete workflow
async function completeWorkflow() {
  try {
    // 1. Create expense
    console.log('=== Creating Expense ===');
    const expense = createExpense({
      group_id: 'group-123',
      description: 'Monthly Rent',
      amount: 2000.00,
      currency: 'USD',
      paid_by: 'user-456',
      category: 'Housing',
      split_with: ['user-456', 'user-789'],
    });
    console.log('Created:', expense);

    // 2. Fetch and display
    console.log('\n=== Fetching Expense ===');
    const fetched = getExpenseById(expense.id);
    console.log('Fetched:', fetched);

    // 3. Update
    console.log('\n=== Updating Expense ===');
    const updated = updateExpense(expense.id, {
      amount: 2200.00,
      description: 'Monthly Rent (updated)',
    });
    console.log('Updated:', updated);

    // 4. Calculate balances
    console.log('\n=== Calculating Balances ===');
    const balances = calculateGroupBalances('group-123');
    console.log('Balances:', balances);

    // 5. Cleanup
    console.log('\n=== Deleting Expense ===');
    deleteExpense(expense.id);
    console.log('Deleted successfully');

  } catch (error) {
    console.error('Error in workflow:', error);
  }
}

// Example 10: API endpoint usage (fetch examples)
async function apiEndpointExamples() {
  const baseUrl = 'http://localhost:3000/api/expenses';

  // GET all expenses for a group
  const groupExpenses = await fetch(`${baseUrl}?groupId=group-123`);
  const groupData = await groupExpenses.json();
  console.log('Group expenses:', groupData);

  // GET all expenses for a user
  const userExpenses = await fetch(`${baseUrl}?userId=user-456`);
  const userData = await userExpenses.json();
  console.log('User expenses:', userData);

  // POST create expense
  const newExpense = await fetch(baseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      group_id: 'group-123',
      description: 'New expense',
      amount: 100.00,
      paid_by: 'user-456',
    }),
  });
  const createdExpense = await newExpense.json();
  console.log('Created expense:', createdExpense);

  // PUT update expense
  const updated = await fetch(`${baseUrl}/expense-id`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: 150.00,
    }),
  });
  const updatedExpense = await updated.json();
  console.log('Updated expense:', updatedExpense);

  // DELETE expense
  const deleted = await fetch(`${baseUrl}/expense-id`, {
    method: 'DELETE',
  });
  const deleteResult = await deleted.json();
  console.log('Delete result:', deleteResult);
}

// Export examples for use in tests or other files
export {
  createExampleExpense,
  fetchGroupExpenses,
  fetchExpenseDetails,
  updateExampleExpense,
  updateExpenseSplit,
  showGroupBalances,
  showUserBalance,
  deleteExampleExpense,
  completeWorkflow,
  apiEndpointExamples,
};

// Run examples if this file is executed directly
if (require.main === module) {
  console.log('Running expense API examples...\n');
  completeWorkflow()
    .then(() => console.log('\nExamples completed successfully'))
    .catch(error => console.error('Examples failed:', error));
}
