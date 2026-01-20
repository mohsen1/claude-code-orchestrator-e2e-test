"use client";

import { useState } from "react";

interface Expense {
  id: number;
  description: string;
  amount: number;
}

export default function Home() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");

  const addExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !amount) return;

    const newExpense: Expense = {
      id: Date.now(),
      description: description.trim(),
      amount: parseFloat(amount),
    };

    setExpenses([...expenses, newExpense]);
    setDescription("");
    setAmount("");
  };

  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
          Expense Tracker
        </h1>

        {/* Total Amount */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <p className="text-gray-600 text-sm uppercase tracking-wide">
            Total Expenses
          </p>
          <p className="text-4xl font-bold text-gray-900 mt-2">
            ${total.toFixed(2)}
          </p>
        </div>

        {/* Add Expense Form */}
        <form onSubmit={addExpense} className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Add New Expense
          </h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <input
                type="text"
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="Enter expense description"
                required
              />
            </div>
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                Amount
              </label>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                step="0.01"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="Enter amount"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Add Expense
            </button>
          </div>
        </form>

        {/* Expenses List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Expenses List
          </h2>
          {expenses.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No expenses yet. Add your first expense above!
            </p>
          ) : (
            <ul className="space-y-3">
              {expenses.map((expense) => (
                <li
                  key={expense.id}
                  className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <span className="text-gray-900 font-medium">
                    {expense.description}
                  </span>
                  <span className="text-lg font-semibold text-blue-600">
                    ${expense.amount.toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}
