'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, MoreVertical, UserPlus } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Member {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
}

interface MemberListProps {
  members: Member[];
  groupId: string;
}

export function MemberList({ members, groupId }: MemberListProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-3">
      {members.map((member) => (
        <div
          key={member.id}
          className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Avatar className="h-9 w-9">
              <AvatarImage src={member.avatar || undefined} />
              <AvatarFallback className="text-sm bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                {getInitials(member.name)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-900 dark:text-slate-100 truncate">
                {member.name}
              </p>
              <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
                <Mail className="h-3 w-3" />
                <span className="truncate">{member.email}</span>
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>View Profile</DropdownMenuItem>
              <DropdownMenuItem>Remove from Group</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ))}

      {/* Invite Member Button */}
      <Button
        variant="outline"
        className="w-full justify-start text-slate-600 dark:text-slate-400"
        size="sm"
      >
        <UserPlus className="mr-2 h-4 w-4" />
        Invite Member
      </Button>
    </div>
  );
}
