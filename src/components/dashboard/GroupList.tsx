'use client';

import { useState } from 'react';
import { Search, Filter, SortAsc } from 'lucide-react';
import { GroupCard } from './GroupCard';
import { CreateGroupDialog } from './CreateGroupDialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

interface Group {
  id: string;
  name: string;
  description?: string;
  memberCount: number;
  balance: number;
  currency?: string;
  members?: Array<{
    id: string;
    name?: string | null;
    image?: string | null;
  }>;
}

interface GroupListProps {
  groups?: Group[];
  isLoading?: boolean;
  onCreateGroup?: (data: { name: string; description: string }) => void;
  onGroupClick?: (groupId: string) => void;
}

export function GroupList({
  groups = [],
  isLoading = false,
  onCreateGroup,
  onGroupClick,
}: GroupListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'balance'>('recent');

  const filteredAndSortedGroups = groups
    .filter((group) =>
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'balance':
          return Math.abs(b.balance) - Math.abs(a.balance);
        case 'recent':
        default:
          return 0; // In real app, would sort by created/updated timestamp
      }
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Your Groups</h2>
          <p className="text-muted-foreground">
            {groups.length} group{groups.length !== 1 ? 's' : ''}
          </p>
        </div>
        <CreateGroupDialog onCreateGroup={onCreateGroup} />
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search groups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SortAsc className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Recent</SelectItem>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="balance">Balance</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Groups Grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="space-y-3 rounded-lg border p-6">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-20 w-full" />
            </div>
          ))}
        </div>
      ) : filteredAndSortedGroups.length === 0 ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Filter className="h-8 w-8 text-primary" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">No groups found</h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-sm">
            {searchQuery
              ? 'Try adjusting your search query to find what you\'re looking for.'
              : groups.length === 0
              ? 'Get started by creating your first group to track shared expenses.'
              : 'Create a new group or adjust your filters.'}
          </p>
          {!searchQuery && groups.length === 0 && (
            <div className="mt-6">
              <CreateGroupDialog onCreateGroup={onCreateGroup} />
            </div>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredAndSortedGroups.map((group) => (
            <GroupCard
              key={group.id}
              {...group}
              onClick={() => onGroupClick?.(group.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
