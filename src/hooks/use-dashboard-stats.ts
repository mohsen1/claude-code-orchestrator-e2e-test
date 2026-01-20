import { useState, useEffect } from 'react';

export interface GroupBalance {
  groupId: string;
  groupName: string;
  totalOwed: number;
  totalOwing: number;
  netBalance: number;
}

export interface DashboardStats {
  totalOwed: number;
  totalOwing: number;
  netBalance: number;
  groupBalances: GroupBalance[];
  totalGroups: number;
  activeExpenses: number;
  previousPeriod?: {
    totalOwed: number;
    totalOwing: number;
    netBalance: number;
  };
}

export interface UseDashboardStatsOptions {
  enabled?: boolean;
  refetchInterval?: number;
}

export function useDashboardStats(
  userId: string | undefined,
  options: UseDashboardStatsOptions = {}
) {
  const { enabled = true, refetchInterval } = options;

  const [data, setData] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = async () => {
    if (!userId || !enabled) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/dashboard/stats?userId=${userId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard statistics');
      }

      const stats: DashboardStats = await response.json();
      setData(stats);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    if (refetchInterval) {
      const interval = setInterval(fetchStats, refetchInterval);
      return () => clearInterval(interval);
    }
  }, [userId, enabled, refetchInterval]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchStats,
  };
}
