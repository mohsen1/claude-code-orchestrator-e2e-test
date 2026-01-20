import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, CreditCard } from 'lucide-react';

interface DashboardHeaderProps {
  onCreateGroup: () => void;
  onSettleUp: () => void;
}

export function DashboardHeader({ onCreateGroup, onSettleUp }: DashboardHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Manage your expense groups and track balances
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={onCreateGroup}
          className="w-full sm:w-auto"
          size="default"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Group
        </Button>
        <Button
          onClick={onSettleUp}
          variant="outline"
          className="w-full sm:w-auto"
          size="default"
        >
          <CreditCard className="mr-2 h-4 w-4" />
          Settle Up
        </Button>
      </div>
    </div>
  );
}
