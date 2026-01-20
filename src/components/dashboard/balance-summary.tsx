'use client';

import React, { useEffect, useState } from 'react';
import { Wallet, ArrowUpCircle, ArrowDownCircle, Scale } from 'lucide-react';
import { BalanceCard } from './balance-card';
import { useDashboardStats, DashboardStats } from '@/hooks/use-dashboard-stats';

export interface BalanceSummaryProps {
  userId: string;
  className?: string;
}

export function BalanceSummary({ userId, className }: BalanceSummaryProps) {
  const { data: stats, isLoading, error } = useDashboardStats(userId, {
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const [trends, setTrends] = useState({
    owed: 0,
    owing: 0,
    net: 0,
  });

  // Calculate trends when we have previous period data
  useEffect(() => {
    if (stats?.previousPeriod) {
      const { totalOwed, totalOwing, netBalance } = stats;
      const { totalOwed: prevOwed, totalOwing: prevOwing, netBalance: prevNet } = stats.previousPeriod;

      setTrends({
        owed: calculateTrend(totalOwed, prevOwed),
        owing: calculateTrend(totalOwing, prevOwing),
        net: calculateTrend(netBalance, prevNet),
      });
    }
  }, [stats]);

  const calculateTrend = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / Math.abs(previous)) * 100;
  };

  if (isLoading) {
    return (
      <div className={className}>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-32 rounded-xl border bg-card p-6 animate-pulse"
            >
              <div className="h-4 w-24 rounded bg-muted" />
              <div className="mt-4 h-8 w-32 rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className={className}>
        <div className="flex h-32 items-center justify-center rounded-xl border border-dashed">
          <p className="text-sm text-muted-foreground">
            {error?.message || 'Unable to load balance summary'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <BalanceCard
          title="Total Owed to You"
          amount={stats.totalOwed}
          icon={ArrowUpCircle}
          variant="owed"
          trend={
            trends.owed !== 0
              ? {
                  value: trends.owed,
                  period: 'from last month',
                }
              : undefined
          }
        />

        <BalanceCard
          title="Total You Owe"
          amount={stats.totalOwing}
          icon={ArrowDownCircle}
          variant="owing"
          trend={
            trends.owing !== 0
              ? {
                  value: -Math.abs(trends.owing),
                  period: 'from last month',
                }
              : undefined
          }
        />

        <BalanceCard
          title="Net Balance"
          amount={stats.netBalance}
          icon={Scale}
          variant={stats.netBalance >= 0 ? 'default' : 'owing'}
          trend={
            trends.net !== 0
              ? {
                  value: trends.net,
                  period: 'from last month',
                }
              : undefined
          }
        />
      </div>

      {/* Additional summary info */}
      {(stats.totalGroups > 0 || stats.activeExpenses > 0) && (
        <div className="mt-4 flex items-center justify-between rounded-lg border bg-card px-4 py-3 text-sm">
          <div className="flex gap-6">
            <div>
              <span className="text-muted-foreground">Active Groups: </span>
              <span className="font-semibold">{stats.totalGroups}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Pending Expenses: </span>
              <span className="font-semibold">{stats.activeExpenses}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
