'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Loader2, DollarSign } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';

interface Member {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
}

interface Balance {
  userId: string;
  userName: string;
  balance: number;
  owes?: Array<{ userId: string; userName: string; amount: number }>;
  owedBy?: Array<{ userId: string; userName: string; amount: number }>;
}

interface SettleUpButtonProps {
  groupId: string;
  members: Member[];
  balances: Balance[];
  trigger?: React.ReactNode;
}

export function SettleUpButton({ groupId, members, balances, trigger }: SettleUpButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fromUserId, setFromUserId] = useState<string>('');
  const [toUserId, setToUserId] = useState<string>('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fromUserId) {
      setError('Please select who is paying');
      return;
    }

    if (!toUserId) {
      setError('Please select who is receiving');
      return;
    }

    if (fromUserId === toUserId) {
      setError('Payer and receiver cannot be the same person');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/settlements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId,
          fromUserId,
          toUserId,
          amount: parseFloat(amount),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to record settlement');
      }

      setOpen(false);
      setFromUserId('');
      setToUserId('');
      setAmount('');
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record settlement');
    } finally {
      setLoading(false);
    }
  };

  // Get suggested settlements
  const suggestedSettlements = balances
    .filter(b => b.owes && b.owes.length > 0)
    .flatMap(b =>
      b.owes?.map(owe => ({
        from: b.userId,
        fromName: b.userName,
        to: owe.userId,
        toName: owe.userName,
        amount: owe.amount,
      })) || []
    );

  const useSuggestion = (suggestion: typeof suggestedSettlements[0]) => {
    setFromUserId(suggestion.from);
    setToUserId(suggestion.to);
    setAmount(suggestion.amount.toString());
  };

  const defaultTrigger = (
    <Button variant="outline">
      <DollarSign className="mr-2 h-4 w-4" />
      Settle Up
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Record Settlement</DialogTitle>
            <DialogDescription>
              Record a payment between group members to settle up debts.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Suggested Settlements */}
            {suggestedSettlements.length > 0 && (
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-3 bg-slate-50 dark:bg-slate-800/50">
                <Label className="text-sm font-semibold mb-2 block">Suggested Settlements</Label>
                <div className="space-y-2">
                  {suggestedSettlements.map((suggestion, idx) => (
                    <Button
                      key={idx}
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-xs h-auto py-2 px-3"
                      onClick={() => useSuggestion(suggestion)}
                    >
                      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                        <span className="font-medium">{suggestion.fromName}</span>
                        <span>→</span>
                        <span className="font-medium">{suggestion.toName}</span>
                        <span className="ml-auto font-bold">${suggestion.amount.toFixed(2)}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="from">From (Payer) *</Label>
              <Select value={fromUserId} onValueChange={setFromUserId} disabled={loading}>
                <SelectTrigger id="from">
                  <SelectValue placeholder="Select who is paying" />
                </SelectTrigger>
                <SelectContent>
                  {members.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={member.avatar || undefined} />
                          <AvatarFallback className="text-xs">
                            {getInitials(member.name)}
                          </AvatarFallback>
                        </Avatar>
                        {member.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="to">To (Receiver) *</Label>
              <Select value={toUserId} onValueChange={setToUserId} disabled={loading}>
                <SelectTrigger id="to">
                  <SelectValue placeholder="Select who is receiving" />
                </SelectTrigger>
                <SelectContent>
                  {members.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={member.avatar || undefined} />
                          <AvatarFallback className="text-xs">
                            {getInitials(member.name)}
                          </AvatarFallback>
                        </Avatar>
                        {member.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="amount">Amount ($) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={loading}
              />
            </div>

            {error && (
              <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-3">
                <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Recording...
                </>
              ) : (
                'Record Settlement'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
