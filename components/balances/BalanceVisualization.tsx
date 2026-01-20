"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react"

export interface Balance {
  owes: string
  owedBy: string
  amount: number
}

export interface MemberBalance {
  memberId: string
  memberName: string
  totalOwed: number
  totalOwes: number
  netBalance: number
}

interface BalanceVisualizationProps {
  balances: Balance[]
  memberBalances: MemberBalance[]
}

export function BalanceVisualization({
  balances,
  memberBalances,
}: BalanceVisualizationProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(Math.abs(amount))
  }

  const getBalanceStatus = (netBalance: number) => {
    if (netBalance > 0.01) return "positive"
    if (netBalance < -0.01) return "negative"
    return "settled"
  }

  const getBalanceVariant = (status: string) => {
    switch (status) {
      case "positive":
        return "success"
      case "negative":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const getBalanceText = (netBalance: number) => {
    if (netBalance > 0.01) {
      return `gets back ${formatCurrency(netBalance)}`
    } else if (netBalance < -0.01) {
      return `owes ${formatCurrency(netBalance)}`
    }
    return "settled up"
  }

  return (
    <div className="space-y-6">
      {/* Individual Balances Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Balance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {memberBalances.map((memberBalance) => {
              const status = getBalanceStatus(memberBalance.netBalance)
              return (
                <div
                  key={memberBalance.memberId}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`
                        w-10 h-10 rounded-full flex items-center justify-center font-semibold text-lg
                        ${
                          status === "positive"
                            ? "bg-green-100 text-green-700"
                            : status === "negative"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-700"
                        }
                      `}
                    >
                      {memberBalance.memberName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold">{memberBalance.memberName}</p>
                      <p className="text-sm text-muted-foreground">
                        Paid: {formatCurrency(memberBalance.totalOwed)} •
                        Share: {formatCurrency(memberBalance.totalOwes)}
                      </p>
                    </div>
                  </div>
                  <Badge variant={getBalanceVariant(status) as any} className="font-semibold">
                    {getBalanceText(memberBalance.netBalance)}
                  </Badge>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Who Owes Whom - Graphical Representation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Settlement Plan</CardTitle>
          <p className="text-sm text-muted-foreground">
            Suggested payments to settle all balances
          </p>
        </CardHeader>
        <CardContent>
          {balances.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <CheckCircle2 className="h-12 w-12 text-green-500 mb-3" />
              <p className="text-center font-medium">All Settled Up!</p>
              <p className="text-center text-sm text-muted-foreground mt-1">
                No outstanding balances
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {balances.map((balance, index) => (
                <div
                  key={`${balance.owes}-${balance.owedBy}-${index}`}
                  className="relative p-4 rounded-lg border bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-950/20 dark:to-yellow-950/20"
                >
                  {/* Payment Arrow Diagram */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1 text-right">
                      <div className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-sm">
                        <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center font-semibold text-red-700 dark:text-red-400">
                          {balance.owes.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold">{balance.owes}</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-center px-4">
                      <ArrowRight className="h-6 w-6 text-orange-500" />
                      <span className="text-xs font-semibold text-orange-600 dark:text-orange-400 mt-1">
                        pays
                      </span>
                    </div>

                    <div className="flex-1 text-left">
                      <div className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-sm">
                        <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center font-semibold text-green-700 dark:text-green-400">
                          {balance.owedBy.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold">{balance.owedBy}</span>
                      </div>
                    </div>
                  </div>

                  {/* Amount Badge */}
                  <div className="flex justify-center">
                    <Badge
                      variant="warning"
                      className="text-base px-4 py-1.5 font-bold"
                    >
                      {formatCurrency(balance.amount)}
                    </Badge>
                  </div>

                  {/* Visual Bar */}
                  <div className="mt-3 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full transition-all duration-500"
                      style={{
                        width: "100%",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Total Outstanding */}
          {balances.length > 0 && (
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                  <span className="font-medium">Total Outstanding</span>
                </div>
                <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                  {formatCurrency(
                    balances.reduce((sum, b) => sum + b.amount, 0)
                  )}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Simplified View - Quick Actions */}
      {balances.length > 0 && (
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold mb-1">Quick Settlement Tips</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Complete payments in the order shown above</li>
                  <li>• Each person only needs to make one payment</li>
                  <li>• This minimizes the total number of transactions</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
