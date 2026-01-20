'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { MoreVertical, Trash2, Edit } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useState } from 'react';

interface ExpenseSplit {
  userId: string;
  name: string;
  amount: number;
}

interface Expense {
  id: string;
  groupId: string;
  description: string;
  amount: number;
  paidBy: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  };
  date: string;
  splits: ExpenseSplit[];
}

interface ExpenseCardProps {
  expense: Expense;
  groupId: string;
}

export function ExpenseCard({ expense, groupId }: ExpenseCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;

    return format(date, 'MMM d, yyyy');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // In a real app, this would call an API endpoint
      // await fetch(`/api/expenses/${expense.id}`, { method: 'DELETE' });
      console.log('Deleting expense:', expense.id);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Failed to delete expense:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            {/* Left: Description and Date */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                {expense.description}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {formatDate(expense.date)}
              </p>
            </div>

            {/* Middle: Paid By */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Avatar className="h-8 w-8">
                <AvatarImage src={expense.paidBy.avatar || undefined} />
                <AvatarFallback className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                  {getInitials(expense.paidBy.name)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block">
                <p className="text-xs text-slate-600 dark:text-slate-400">Paid by</p>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {expense.paidBy.name}
                </p>
              </div>
            </div>

            {/* Right: Amount and Actions */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="text-right">
                <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  ${expense.amount.toFixed(2)}
                </p>
                <Badge variant="secondary" className="text-xs mt-1">
                  Split {expense.splits.length} ways
                </Badge>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-600 dark:text-red-400"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Split Details */}
          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">Split breakdown:</p>
            <div className="flex flex-wrap gap-2">
              {expense.splits.map((split) => (
                <Badge key={split.userId} variant="outline" className="text-xs">
                  {split.name}: ${split.amount.toFixed(2)}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Expense?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{expense.description}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
