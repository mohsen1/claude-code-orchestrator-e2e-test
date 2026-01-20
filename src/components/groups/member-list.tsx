'use client';

import { Shield, User, MoreVertical, Crown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Member {
  id: string;
  groupId: string;
  userId: string;
  role: 'admin' | 'member';
  joinedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
}

interface MemberListProps {
  groupId: string;
  members: Member[];
  currentUserId: string;
  currentUserRole: 'admin' | 'member';
  onUpdate: () => void;
}

export function MemberList({
  groupId,
  members,
  currentUserId,
  currentUserRole,
  onUpdate,
}: MemberListProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [memberToUpdate, setMemberToUpdate] = useState<string | null>(null);

  const canManageMembers = currentUserRole === 'admin';

  const handleRoleChange = async (memberId: string, newRole: 'admin' | 'member') => {
    if (!canManageMembers) return;

    setMemberToUpdate(memberId);
    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/groups/${groupId}/members/${memberId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: newRole }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update role');
      }

      toast({
        title: 'Success',
        description: `Member role updated to ${newRole}`,
      });

      onUpdate();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update role',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setMemberToUpdate(null);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!canManageMembers && memberId !== currentUserId) return;

    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/groups/${groupId}/members/${memberId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to remove member');
      }

      toast({
        title: 'Success',
        description: 'Member removed successfully',
      });

      onUpdate();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to remove member',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-2">
      {members.map((member) => {
        const isCurrentUser = member.userId === currentUserId;
        const isAdmin = member.role === 'admin';
        const isLoadingMember = memberToUpdate === member.userId && isLoading;

        return (
          <div
            key={member.id}
            className="flex items-center justify-between p-3 rounded-lg border bg-card"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex-shrink-0">
                {member.user.image ? (
                  <img
                    src={member.user.image}
                    alt={member.user.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium truncate">
                    {member.user.name}
                  </p>
                  {isAdmin && (
                    <Crown className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                  )}
                  {isCurrentUser && (
                    <span className="text-xs text-muted-foreground">(You)</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {member.user.email}
                </p>
                <p className="text-xs text-muted-foreground">
                  Joined {formatDate(member.joinedAt)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={`text-xs px-2 py-1 rounded-full ${
                isAdmin
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                  : 'bg-muted text-muted-foreground'
              }`}>
                {isAdmin ? 'Admin' : 'Member'}
              </span>

              {(canManageMembers || isCurrentUser) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      disabled={isLoadingMember}
                    >
                      {isLoadingMember ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <MoreVertical className="h-4 w-4" />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {canManageMembers && !isCurrentUser && (
                      <>
                        {isAdmin ? (
                          <DropdownMenuItem
                            onClick={() => handleRoleChange(member.userId, 'member')}
                          >
                            <Shield className="h-4 w-4 mr-2" />
                            Make Member
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => handleRoleChange(member.userId, 'admin')}
                          >
                            <Crown className="h-4 w-4 mr-2" />
                            Make Admin
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem
                          onSelect={(e) => e.preventDefault()}
                          className="text-destructive focus:text-destructive"
                        >
                          {isCurrentUser ? 'Leave Group' : 'Remove Member'}
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            {isCurrentUser ? 'Leave Group?' : 'Remove Member?'}
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            {isCurrentUser
                              ? 'Are you sure you want to leave this group? You will need a new invite to rejoin.'
                              : `Remove ${member.user.name} from this group? They will need a new invite to rejoin.`}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleRemoveMember(member.userId)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {isCurrentUser ? 'Leave' : 'Remove'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
