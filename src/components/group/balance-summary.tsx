'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BalanceOwe {
  userId: string;
  userName: string;
  amount: number;
}

interface Balance {
  userId: string;
  userName: string;
  balance: number;
  owes?: BalanceOwe[];
  owedBy?: BalanceOwe[];
}

interface BalanceSummaryProps {
  balances: Balance[];
}

export function BalanceSummary({ balances }: BalanceSummaryProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const totalExpenses = balances.reduce((sum, b) => {
    if (b.balance < 0) return sum + Math.abs(b.balance);
    return sum;
  }, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Balance Summary</span>
          {totalExpenses > 0 && (
            <span className="text-sm font-normal text-slate-600 dark:text-slate-400">
              Total unsettled: ${totalExpenses.toFixed(2)}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {balances.map((balance) => {
            const isPositive = balance.balance > 0;
            const isNegative = balance.balance < 0;
            const isSettled = balance.balance === 0;

            return (
              <div
                key={balance.userId}
                className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
              >
                <div className="flex items-center gap-3 flex-1">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={balance.owedBy?.[0]?.avatar || undefined} />
                    <AvatarFallback className="text-sm bg-slate-200 dark:bg-slate-700">
                      {getInitials(balance.userName)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 dark:text-slate-100 truncate">
                      {balance.userName}
                    </p>
                    {isSettled ? (
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        All settled up
                      </p>
                    ) : isPositive ? (
                      <p className="text-sm text-green-600 dark:text-green-400">
                        Gets back ${balance.balance.toFixed(2)}
                      </p>
                    ) : (
                      <p className="text-sm text-red-600 dark:text-red-400">
                        Owes ${Math.abs(balance.balance).toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isSettled ? (
                    <Badge variant="secondary" className="bg-slate-200 dark:bg-slate-700">
                      <Minus className="h-3 w-3 mr-1" />
                      Settled
                    </Badge>
                  ) : isPositive ? (
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +${balance.balance.toFixed(2)}
                    </Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
                      <TrendingDown className="h-3 w-3 mr-1" />
                      -${Math.abs(balance.balance).toFixed(2)}
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Settlement Suggestions */}
        {balances.some(b => b.balance !== 0) && (
          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
              Suggested Settlements
            </h4>
            <div className="space-y-2">
              {balances
                .filter(b => b.owes && b.owes.length > 0)
                .map((balance) => (
                  balance.owes?.map((owe) => (
                    <div
                      key={`${balance.userId}-${owe.userId}`}
                      className="flex items-center justify-between p-2 rounded bg-slate-100 dark:bg-slate-800 text-sm"
                    >
                      <span className="text-slate-700 dark:text-slate-300">
                        <span className="font-medium">{balance.userName}</span> pays{' '}
                        <span className="font-medium">{owe.userName}</span>
                      </span>
                      <Badge variant="outline" className="font-semibold">
                        ${owe.amount.toFixed(2)}
                      </Badge>
                    </div>
                  ))
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
