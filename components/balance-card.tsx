"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface Balance {
  userId: string
  userName: string
  balance: number
  owes: number
  owed: number
}

interface BalanceCardProps {
  balances?: Balance[]
}

export function BalanceCard({ balances = defaultBalances }: BalanceCardProps) {
  const totalOwed = balances.reduce((sum, b) => sum + b.owed, 0)
  const totalOwes = balances.reduce((sum, b) => sum + b.owes, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Group Balances</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Total to receive</p>
              <p className="text-2xl font-bold text-green-600">
                ${totalOwed.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total to pay</p>
              <p className="text-2xl font-bold text-red-600">
                ${totalOwes.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Individual Balances */}
          <div className="space-y-3">
            {balances.map((balance) => (
              <div
                key={balance.userId}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {balance.userName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{balance.userName}</p>
                    <p className="text-sm text-muted-foreground">
                      {balance.balance > 0
                        ? `Gets back $${balance.owed.toFixed(2)}`
                        : balance.balance < 0
                        ? `Owes $${balance.owes.toFixed(2)}`
                        : "Settled up"
                      }
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {balance.balance > 0 ? (
                    <Badge variant="default" className="bg-green-600">
                      +${balance.balance.toFixed(2)}
                    </Badge>
                  ) : balance.balance < 0 ? (
                    <Badge variant="destructive">
                      -${Math.abs(balance.balance).toFixed(2)}
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Settled</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Settlement Suggestions */}
          <div className="border-t pt-4">
            <p className="text-sm font-medium mb-3">Suggested Settlements</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm p-3 bg-muted rounded">
                <span>Bob Johnson → John Doe</span>
                <Badge variant="outline">$45.00</Badge>
              </div>
              <div className="flex items-center justify-between text-sm p-3 bg-muted rounded">
                <span>Jane Smith → John Doe</span>
                <Badge variant="outline">$22.50</Badge>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Mock data for UI demonstration
const defaultBalances: Balance[] = [
  {
    userId: "user1",
    userName: "John Doe",
    balance: 67.50,
    owes: 0,
    owed: 67.50
  },
  {
    userId: "user2",
    userName: "Jane Smith",
    balance: -22.50,
    owes: 22.50,
    owed: 0
  },
  {
    userId: "user3",
    userName: "Bob Johnson",
    balance: -45.00,
    owes: 45.00,
    owed: 0
  }
]
