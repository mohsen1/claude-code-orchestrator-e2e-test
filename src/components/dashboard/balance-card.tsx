import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BalanceCardProps {
  title: string;
  amount: number;
  icon: LucideIcon;
  trend?: {
    value: number;
    period: string;
  };
  variant?: 'default' | 'owed' | 'owing';
  className?: string;
}

export function BalanceCard({
  title,
  amount,
  icon: Icon,
  trend,
  variant = 'default',
  className,
}: BalanceCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'owed':
        return {
          iconBg: 'bg-emerald-100 dark:bg-emerald-900/20',
          iconColor: 'text-emerald-600 dark:text-emerald-400',
          amountColor: 'text-emerald-600 dark:text-emerald-400',
          trendIcon: TrendingUp,
          trendColor: 'text-emerald-600 dark:text-emerald-400',
        };
      case 'owing':
        return {
          iconBg: 'bg-rose-100 dark:bg-rose-900/20',
          iconColor: 'text-rose-600 dark:text-rose-400',
          amountColor: 'text-rose-600 dark:text-rose-400',
          trendIcon: TrendingDown,
          trendColor: 'text-rose-600 dark:text-rose-400',
        };
      default:
        return {
          iconBg: 'bg-blue-100 dark:bg-blue-900/20',
          iconColor: 'text-blue-600 dark:text-blue-400',
          amountColor: 'text-foreground',
          trendIcon: Minus,
          trendColor: 'text-muted-foreground',
        };
    }
  };

  const styles = getVariantStyles();
  const TrendIcon = trend?.value && trend.value > 0 ? TrendingUp :
                    trend?.value && trend.value < 0 ? TrendingDown :
                    Minus;
  const trendColor = trend?.value > 0 ? styles.trendColor :
                     trend?.value < 0 ? 'text-rose-600 dark:text-rose-400' :
                     'text-muted-foreground';

  return (
    <div
      className={cn(
        'rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p
            className={cn(
              'mt-2 text-3xl font-bold tracking-tight',
              styles.amountColor
            )}
          >
            {formatCurrency(Math.abs(amount))}
          </p>

          {trend && (
            <div className="mt-2 flex items-center gap-1">
              <TrendIcon className={cn('h-4 w-4', trendColor)} />
              <span className={cn('text-sm font-medium', trendColor)}>
                {trend.value > 0 ? '+' : ''}
                {trend.value.toFixed(1)}%
              </span>
              <span className="text-sm text-muted-foreground">
                {trend.period}
              </span>
            </div>
          )}
        </div>

        <div
          className={cn(
            'rounded-lg p-3',
            styles.iconBg
          )}
        >
          <Icon className={cn('h-5 w-5', styles.iconColor)} />
        </div>
      </div>
    </div>
  );
}
