import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { BalanceSummary } from '@/components/group/balance-summary';
import { ExpenseList } from '@/components/group/expense-list';
import { AddExpenseButton } from '@/components/group/add-expense-dialog';
import { MemberList } from '@/components/group/member-list';
import { SettleUpButton } from '@/components/group/settle-up-dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, Receipt } from 'lucide-react';
import Link from 'next/link';

interface GroupPageProps {
  params: {
    id: string;
  };
}

async function getGroup(id: string) {
  // In a real app, this would fetch from your database
  // For now, returning mock data
  return {
    id,
    name: 'Apartment Expenses',
    description: 'Shared expenses for apartment 4B',
    createdAt: new Date().toISOString(),
    members: [
      { id: '1', name: 'John Doe', email: 'john@example.com', avatar: null },
      { id: '2', name: 'Jane Smith', email: 'jane@example.com', avatar: null },
      { id: '3', name: 'Bob Wilson', email: 'bob@example.com', avatar: null },
    ],
  };
}

async function getExpenses(groupId: string) {
  // Mock expense data
  return [
    {
      id: '1',
      groupId,
      description: 'Grocery shopping',
      amount: 150.00,
      paidBy: { id: '1', name: 'John Doe', email: 'john@example.com', avatar: null },
      date: new Date(Date.now() - 86400000).toISOString(),
      splits: [
        { userId: '1', name: 'John Doe', amount: 50.00 },
        { userId: '2', name: 'Jane Smith', amount: 50.00 },
        { userId: '3', name: 'Bob Wilson', amount: 50.00 },
      ],
    },
    {
      id: '2',
      groupId,
      description: 'Electric bill',
      amount: 120.00,
      paidBy: { id: '2', name: 'Jane Smith', email: 'jane@example.com', avatar: null },
      date: new Date(Date.now() - 172800000).toISOString(),
      splits: [
        { userId: '1', name: 'John Doe', amount: 40.00 },
        { userId: '2', name: 'Jane Smith', amount: 40.00 },
        { userId: '3', name: 'Bob Wilson', amount: 40.00 },
      ],
    },
    {
      id: '3',
      groupId,
      description: 'Internet',
      amount: 80.00,
      paidBy: { id: '3', name: 'Bob Wilson', email: 'bob@example.com', avatar: null },
      date: new Date(Date.now() - 259200000).toISOString(),
      splits: [
        { userId: '1', name: 'John Doe', amount: 26.67 },
        { userId: '2', name: 'Jane Smith', amount: 26.67 },
        { userId: '3', name: 'Bob Wilson', amount: 26.66 },
      ],
    },
  ];
}

async function getBalances(groupId: string) {
  // Mock balance data
  return [
    { userId: '1', userName: 'John Doe', balance: -16.67, owes: [{ userId: '2', userName: 'Jane Smith', amount: 10.00 }, { userId: '3', userName: 'Bob Wilson', amount: 6.67 }] },
    { userId: '2', userName: 'Jane Smith', balance: 30.00, owedBy: [{ userId: '1', userName: 'John Doe', amount: 10.00 }, { userId: '3', userName: 'Bob Wilson', amount: 20.00 }] },
    { userId: '3', userName: 'Bob Wilson', balance: -13.33, owes: [{ userId: '2', userName: 'Jane Smith', amount: 13.33 }] },
  ];
}

export default async function GroupPage({ params }: GroupPageProps) {
  const group = await getGroup(params.id);

  if (!group) {
    notFound();
  }

  const expenses = await getExpenses(params.id);
  const balances = await getBalances(params.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                {group.name}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                {group.description}
              </p>
            </div>
            <div className="flex gap-2">
              <AddExpenseButton groupId={group.id} members={group.members} />
              <SettleUpButton groupId={group.id} members={group.members} balances={balances} />
            </div>
          </div>
        </div>

        {/* Balance Summary */}
        <div className="mb-8">
          <Suspense fallback={<BalanceSummarySkeleton />}>
            <BalanceSummary balances={balances} />
          </Suspense>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Expenses Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Expenses
                </CardTitle>
                <CardDescription>
                  Track and manage shared expenses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<ExpenseListSkeleton />}>
                  <ExpenseList expenses={expenses} groupId={group.id} />
                </Suspense>
              </CardContent>
            </Card>
          </div>

          {/* Members Section */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Members
                </CardTitle>
                <CardDescription>
                  {group.members.length} members
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MemberList members={group.members} groupId={group.id} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function BalanceSummarySkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ExpenseListSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
      ))}
    </div>
  );
}
