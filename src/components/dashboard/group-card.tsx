'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TrendingUp, TrendingDown, Minus, Users } from 'lucide-react';

export interface GroupMember {
  id: string;
  name: string;
  avatar?: string;
}

export interface Group {
  id: string;
  name: string;
  netBalance: number;
  members: GroupMember[];
  lastActivity: Date;
  memberCount: number;
}

interface GroupCardProps {
  group: Group;
}

export function GroupCard({ group }: GroupCardProps) {
  const formatBalance = (balance: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(Math.abs(balance));
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - new Date(date).getTime();
    const diffInMins = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMins < 1) return 'Just now';
    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return new Date(date).toLocaleDateString();
  };

  const getBalanceColor = (balance: number) => {
    if (balance > 0) return 'text-green-600';
    if (balance < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getBalanceIcon = (balance: number) => {
    if (balance > 0) return <TrendingUp className="h-4 w-4" />;
    if (balance < 0) return <TrendingDown className="h-4 w-4" />;
    return <Minus className="h-4 w-4" />;
  };

  const getBalanceText = (balance: number) => {
    if (balance > 0) return `you are owed`;
    if (balance < 0) return `you owe`;
    return `settled up`;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const displayAvatars = group.members.slice(0, 4);
  const remainingCount = Math.max(0, group.memberCount - 4);

  return (
    <Link href={`/groups/${group.id}`}>
      <Card className="group hover:shadow-lg transition-all duration-200 hover:border-primary/50 cursor-pointer h-full">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <h3 className="font-semibold text-lg line-clamp-1">{group.name}</h3>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{group.memberCount}</span>
            </div>
          </div>

          <div className={`flex items-center gap-2 ${getBalanceColor(group.netBalance)}`}>
            {getBalanceIcon(group.netBalance)}
            <div className="flex flex-col">
              <span className="font-semibold text-lg">
                {group.netBalance !== 0 ? formatBalance(group.netBalance) : '$0.00'}
              </span>
              <span className="text-xs font-medium opacity-80">
                {getBalanceText(group.netBalance)}
              </span>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center -space-x-2">
              {displayAvatars.map((member, index) => (
                <Avatar
                  key={member.id}
                  className="border-2 border-background h-8 w-8"
                  style={{ zIndex: displayAvatars.length - index }}
                >
                  {member.avatar ? (
                    <AvatarImage src={member.avatar} alt={member.name} />
                  ) : (
                    <AvatarFallback className="text-xs">
                      {getInitials(member.name)}
                    </AvatarFallback>
                  )}
                </Avatar>
              ))}
              {remainingCount > 0 && (
                <div className="border-2 border-background h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                  +{remainingCount}
                </div>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="px-6 pb-6 pt-0">
          <div className="w-full">
            <p className="text-sm text-muted-foreground">
              Last activity: {formatTimeAgo(group.lastActivity)}
            </p>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
