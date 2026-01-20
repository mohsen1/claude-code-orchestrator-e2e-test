import { notFound } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { ExpenseList } from "@/components/expenses/ExpenseList"
import { AddExpenseForm } from "@/components/expenses/AddExpenseForm"
import { BalanceVisualization } from "@/components/balances/BalanceVisualization"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Users, Receipt, Balance } from "lucide-react"
import Link from "next/link"

interface GroupMember {
  id: string
  name: string
  email: string
}

interface Expense {
  id: string
  description: string
  amount: number
  date: string
  paidBy: GroupMember
  splitAmong: GroupMember[]
}

interface Balance {
  owes: string
  owedBy: string
  amount: number
}

interface MemberBalance {
  memberId: string
  memberName: string
  totalOwed: number
  totalOwes: number
  netBalance: number
}

interface Group {
  id: string
  name: string
  description: string | null
  createdAt: string
  members: GroupMember[]
}

async function getGroup(groupId: string, userId: string): Promise<Group | null> {
  try {
    const db = require("@/lib/db")
    const group = db.getGroup(groupId)

    if (!group) {
      return null
    }

    // Verify user is a member
    const isMember = group.members.some((m: GroupMember) => m.id === userId)
    if (!isMember) {
      return null
    }

    return group
  } catch (error) {
    console.error("Error fetching group:", error)
    return null
  }
}

async function getExpenses(groupId: string): Promise<Expense[]> {
  try {
    const db = require("@/lib/db")
    return db.getExpensesByGroup(groupId)
  } catch (error) {
    console.error("Error fetching expenses:", error)
    return []
  }
}

function calculateBalances(
  expenses: Expense[],
  members: GroupMember[]
): { balances: Balance[]; memberBalances: MemberBalance[] } {
  // Calculate how much each person has paid and their share
  const memberTotals: Map<
    string,
    { paid: number; owes: number; name: string }
  > = new Map()

  members.forEach((member) => {
    memberTotals.set(member.id, {
      paid: 0,
      owes: 0,
      name: member.name,
    })
  })

  expenses.forEach((expense) => {
    // Add to what the payer paid
    const payerTotal = memberTotals.get(expense.paidBy.id)
    if (payerTotal) {
      payerTotal.paid += expense.amount
    }

    // Add to what each person in the split owes
    const shareAmount = expense.amount / expense.splitAmong.length
    expense.splitAmong.forEach((member) => {
      const memberTotal = memberTotals.get(member.id)
      if (memberTotal) {
        memberTotal.owes += shareAmount
      }
    })
  })

  // Calculate net balance for each member
  const memberBalances: MemberBalance[] = []
  memberTotals.forEach((total, memberId) => {
    memberBalances.push({
      memberId,
      memberName: total.name,
      totalOwed: total.paid,
      totalOwes: total.owes,
      netBalance: total.paid - total.owes,
    })
  })

  // Calculate who owes whom (simplified algorithm)
  const balances: Balance[] = []
  const debtors: Array<{ id: string; name: string; amount: number }> = []
  const creditors: Array<{ id: string; name: string; amount: number }> = []

  memberBalances.forEach((mb) => {
    if (mb.netBalance < -0.01) {
      // Person owes money
      debtors.push({
        id: mb.memberId,
        name: mb.memberName,
        amount: Math.abs(mb.netBalance),
      })
    } else if (mb.netBalance > 0.01) {
      // Person is owed money
      creditors.push({
        id: mb.memberId,
        name: mb.memberName,
        amount: mb.netBalance,
      })
    }
  })

  // Match debtors with creditors
  let debtorIndex = 0
  let creditorIndex = 0

  while (
    debtorIndex < debtors.length &&
    creditorIndex < creditors.length
  ) {
    const debtor = debtors[debtorIndex]
    const creditor = creditors[creditorIndex]

    const amount = Math.min(debtor.amount, creditor.amount)

    if (amount > 0.01) {
      balances.push({
        owes: debtor.name,
        owedBy: creditor.name,
        amount: Math.round(amount * 100) / 100,
      })
    }

    debtor.amount -= amount
    creditor.amount -= amount

    if (debtor.amount < 0.01) {
      debtorIndex++
    }
    if (creditor.amount < 0.01) {
      creditorIndex++
    }
  }

  return { balances, memberBalances }
}

export default async function GroupDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Please log in to view this group.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const group = await getGroup(params.id, session.user.id)

  if (!group) {
    notFound()
  }

  const expenses = await getExpenses(params.id)
  const { balances, memberBalances } = calculateBalances(expenses, group.members)

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0)
  const totalMembers = group.members.length

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <Link href="/dashboard">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">{group.name}</h1>
            {group.description && (
              <p className="text-muted-foreground text-lg">{group.description}</p>
            )}
          </div>

          <div className="flex gap-3">
            <Card className="flex-1 min-w-[150px]">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Members</span>
                </div>
                <p className="text-2xl font-bold">{totalMembers}</p>
              </CardContent>
            </Card>

            <Card className="flex-1 min-w-[150px]">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-1">
                  <Receipt className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Expenses</span>
                </div>
                <p className="text-2xl font-bold">{expenses.length}</p>
              </CardContent>
            </Card>

            <Card className="flex-1 min-w-[150px]">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-1">
                  <Balance className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Total</span>
                </div>
                <p className="text-2xl font-bold">
                  ${totalExpenses.toFixed(2)}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Members List */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Group Members
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {group.members.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg"
              >
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium">{member.name}</span>
                {member.id === session.user.id && (
                  <span className="text-xs text-muted-foreground">(You)</span>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="expenses" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="expenses" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            Expenses
          </TabsTrigger>
          <TabsTrigger value="balances" className="flex items-center gap-2">
            <Balance className="h-4 w-4" />
            Balances
          </TabsTrigger>
        </TabsList>

        {/* Expenses Tab */}
        <TabsContent value="expenses" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Add Expense Form */}
            <div className="lg:col-span-1">
              <AddExpenseForm
                groupId={group.id}
                members={group.members}
                currentUserId={session.user.id}
              />
            </div>

            {/* Expense List */}
            <div className="lg:col-span-2">
              <div className="mb-4">
                <h2 className="text-2xl font-bold">Expense History</h2>
                <p className="text-muted-foreground">
                  View and manage all group expenses
                </p>
              </div>
              <ExpenseList
                groupId={group.id}
                expenses={expenses}
              />
            </div>
          </div>
        </TabsContent>

        {/* Balances Tab */}
        <TabsContent value="balances">
          <div className="mb-4">
            <h2 className="text-2xl font-bold">Balance Overview</h2>
            <p className="text-muted-foreground">
              See who owes whom and track settlements
            </p>
          </div>
          <BalanceVisualization
            balances={balances}
            memberBalances={memberBalances}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
