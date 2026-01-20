# Expense API Documentation

## Overview

This document describes the expense CRUD API endpoints for the expense-sharing application.

## Base URL

```
/api/expenses
```

## Authentication

Currently, these endpoints do not require authentication. In production, you should add authentication middleware using NextAuth.js.

---

## Endpoints

### GET /api/expenses

Get all expenses, filtered by group or user.

**Query Parameters:**
- `groupId` (string, optional) - Filter expenses by group ID
- `userId` (string, optional) - Filter expenses by user ID

**Note:** At least one parameter (`groupId` or `userId`) is required.

**Success Response:**
- Status: `200 OK`
- Body:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "group_id": "uuid",
      "description": "Dinner at restaurant",
      "amount": 100.50,
      "currency": "USD",
      "paid_by": "user-uuid",
      "category": "Food",
      "date": "2024-01-20T10:00:00.000Z",
      "created_at": "2024-01-20T10:00:00.000Z",
      "updated_at": "2024-01-20T10:00:00.000Z",
      "paid_by_user": {
        "id": "user-uuid",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "splits": [
        {
          "id": "split-uuid",
          "expense_id": "expense-uuid",
          "user_id": "user-uuid",
          "amount": 50.25,
          "user": {
            "id": "user-uuid",
            "name": "Jane Doe",
            "email": "jane@example.com"
          }
        }
      ]
    }
  ],
  "count": 1
}
```

**Error Response:**
- Status: `400 Bad Request`
- Body:
```json
{
  "error": "Either groupId or userId query parameter is required"
}
```

---

### POST /api/expenses

Create a new expense.

**Request Body:**
```json
{
  "group_id": "uuid (required)",
  "description": "string (required)",
  "amount": "number (required, must be positive)",
  "currency": "string (optional, default: USD)",
  "paid_by": "string (required, user ID)",
  "category": "string (optional)",
  "date": "string (optional, ISO date)",
  "split_with": ["uuid1", "uuid2"] "optional, array of user IDs to split with"
}
```

**Success Response:**
- Status: `201 Created`
- Body:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "group_id": "uuid",
    "description": "Dinner at restaurant",
    "amount": 100.50,
    "currency": "USD",
    "paid_by": "user-uuid",
    "category": "Food",
    "date": "2024-01-20T10:00:00.000Z",
    "created_at": "2024-01-20T10:00:00.000Z",
    "updated_at": "2024-01-20T10:00:00.000Z"
  },
  "message": "Expense created successfully"
}
```

**Error Responses:**

- Status: `400 Bad Request` - Missing required fields
```json
{
  "error": "Missing required fields",
  "fields": ["group_id", "description"]
}
```

- Status: `400 Bad Request` - Invalid amount
```json
{
  "error": "Amount must be a positive number"
}
```

- Status: `400 Bad Request` - Foreign key violation
```json
{
  "error": "Invalid reference",
  "details": "The specified group_id or paid_by user does not exist"
}
```

---

### GET /api/expenses/[id]

Get a single expense by ID.

**URL Parameters:**
- `id` (string) - Expense ID

**Success Response:**
- Status: `200 OK`
- Body:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "group_id": "uuid",
    "description": "Dinner at restaurant",
    "amount": 100.50,
    "currency": "USD",
    "paid_by": "user-uuid",
    "category": "Food",
    "date": "2024-01-20T10:00:00.000Z",
    "created_at": "2024-01-20T10:00:00.000Z",
    "updated_at": "2024-01-20T10:00:00.000Z",
    "paid_by_user": {
      "id": "user-uuid",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "splits": [
      {
        "id": "split-uuid",
        "expense_id": "expense-uuid",
        "user_id": "user-uuid",
        "amount": 50.25,
        "user": {
          "id": "user-uuid",
          "name": "Jane Doe",
          "email": "jane@example.com"
        }
      }
    ]
  }
}
```

**Error Response:**
- Status: `404 Not Found`
- Body:
```json
{
  "error": "Expense not found"
}
```

---

### PUT /api/expenses/[id]

Update an expense (complete update).

**URL Parameters:**
- `id` (string) - Expense ID

**Request Body:**
```json
{
  "description": "string (optional)",
  "amount": "number (optional, must be positive if provided)",
  "currency": "string (optional)",
  "category": "string (optional)",
  "date": "string (optional, ISO date)",
  "split_with": ["uuid1", "uuid2"] "optional, array of user IDs"
}
```

**Success Response:**
- Status: `200 OK`
- Body:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "group_id": "uuid",
    "description": "Updated description",
    "amount": 150.00,
    "currency": "USD",
    "paid_by": "user-uuid",
    "category": "Food",
    "date": "2024-01-20T10:00:00.000Z",
    "created_at": "2024-01-20T10:00:00.000Z",
    "updated_at": "2024-01-20T11:00:00.000Z"
  },
  "message": "Expense updated successfully"
}
```

**Error Responses:**

- Status: `400 Bad Request` - Invalid amount
```json
{
  "error": "Amount must be a positive number"
}
```

- Status: `404 Not Found`
```json
{
  "error": "Expense not found"
}
```

---

### PATCH /api/expenses/[id]

Partially update an expense.

Same behavior as PUT, but only updates the fields provided in the request body.

---

### DELETE /api/expenses/[id]

Delete an expense.

**URL Parameters:**
- `id` (string) - Expense ID

**Success Response:**
- Status: `200 OK`
- Body:
```json
{
  "success": true,
  "message": "Expense deleted successfully"
}
```

**Error Response:**
- Status: `404 Not Found`
- Body:
```json
{
  "error": "Expense not found"
}
```

---

## Database Functions

### createExpense(data)

Create a new expense in the database.

**Parameters:**
- `group_id` (string, required) - Group ID
- `description` (string, required) - Expense description
- `amount` (number, required) - Expense amount
- `currency` (string, optional) - Currency code (default: "USD")
- `paid_by` (string, required) - User ID who paid
- `category` (string, optional) - Expense category
- `date` (string, optional) - Expense date
- `split_with` (string[], optional) - User IDs to split with

**Returns:** Expense object

### getExpenseById(id)

Get expense by ID with full details.

**Parameters:**
- `id` (string) - Expense ID

**Returns:** ExpenseWithDetails object or null

### getExpensesByGroupId(groupId)

Get all expenses for a group.

**Parameters:**
- `groupId` (string) - Group ID

**Returns:** Array of ExpenseWithDetails objects

### getExpensesByUserId(userId)

Get all expenses for a user (across all groups).

**Parameters:**
- `userId` (string) - User ID

**Returns:** Array of ExpenseWithDetails objects

### updateExpense(id, data)

Update an expense.

**Parameters:**
- `id` (string) - Expense ID
- `data` (object) - Fields to update

**Returns:** Updated Expense object or null

### deleteExpense(id)

Delete an expense.

**Parameters:**
- `id` (string) - Expense ID

**Returns:** boolean indicating success

### updateExpenseSplits(expenseId, userIds)

Update expense splits.

**Parameters:**
- `expenseId` (string) - Expense ID
- `userIds` (string[]) - User IDs to split with

**Returns:** boolean indicating success

### calculateGroupBalances(groupId)

Calculate balances for a group.

**Parameters:**
- `groupId` (string) - Group ID

**Returns:** Object mapping user IDs to their balance

### getUserBalance(userId)

Get user's total balance across all groups.

**Parameters:**
- `userId` (string) - User ID

**Returns:** Number representing the balance

---

## Error Handling

All endpoints follow consistent error handling:

- **400 Bad Request** - Invalid input data
- **404 Not Found** - Resource not found
- **409 Conflict** - Unique constraint violation
- **500 Internal Server Error** - Server error

Error responses include:
```json
{
  "error": "Error message",
  "details": "Additional error details"
}
```

---

## Database Schema

### expenses table

| Column | Type | Description |
|--------|------|-------------|
| id | TEXT (PRIMARY KEY) | Expense UUID |
| group_id | TEXT | Group UUID (FK) |
| description | TEXT | Expense description |
| amount | REAL | Expense amount |
| currency | TEXT | Currency code |
| paid_by | TEXT | User UUID who paid (FK) |
| category | TEXT | Expense category |
| date | DATETIME | Expense date |
| created_at | DATETIME | Creation timestamp |
| updated_at | DATETIME | Last update timestamp |

### expense_splits table

| Column | Type | Description |
|--------|------|-------------|
| id | TEXT (PRIMARY KEY) | Split UUID |
| expense_id | TEXT | Expense UUID (FK) |
| user_id | TEXT | User UUID (FK) |
| amount | REAL | Split amount |

---

## Usage Examples

### Create an expense

```javascript
const response = await fetch('/api/expenses', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    group_id: 'group-uuid',
    description: 'Dinner at restaurant',
    amount: 100.50,
    paid_by: 'user-uuid',
    category: 'Food',
    split_with: ['user1-uuid', 'user2-uuid', 'user3-uuid']
  })
});
```

### Get all expenses for a group

```javascript
const response = await fetch('/api/expenses?groupId=group-uuid');
const { data } = await response.json();
```

### Update an expense

```javascript
const response = await fetch('/api/expenses/expense-uuid', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    description: 'Updated description',
    amount: 150.00
  })
});
```

### Delete an expense

```javascript
const response = await fetch('/api/expenses/expense-uuid', {
  method: 'DELETE'
});
```
