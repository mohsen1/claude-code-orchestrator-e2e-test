import { Users, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface GroupCardProps {
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
  onClick?: () => void;
}

export function GroupCard({
  id,
  name,
  description,
  memberCount,
  balance,
  currency = 'USD',
  members = [],
  onClick,
}: GroupCardProps) {
  const isOwed = balance > 0;
  const owes = balance < 0;
  const balanceFormatted = Math.abs(balance).toFixed(2);

  const getInitials = (name?: string | null) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const displayMembers = members.slice(0, 4);
  const remainingMembers = Math.max(0, memberCount - 4);

  return (
    <Card
      className="group cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1"
      onClick={onClick}
    >
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate">{name}</h3>
            {description && (
              <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
            )}
          </div>
          <Badge
            variant={isOwed ? 'default' : owes ? 'destructive' : 'secondary'}
            className="shrink-0 ml-2"
          >
            {isOwed && <ArrowUpRight className="mr-1 h-3 w-3" />}
            {owes && <ArrowDownRight className="mr-1 h-3 w-3" />}
            {currency} {balanceFormatted}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{memberCount} member{memberCount !== 1 ? 's' : ''}</span>
        </div>

        {members.length > 0 && (
          <div className="flex items-center -space-x-2">
            {displayMembers.map((member) => (
              <Avatar
                key={member.id}
                className="h-8 w-8 border-2 border-background shrink-0"
                title={member.name || undefined}
              >
                <AvatarImage src={member.image || undefined} alt={member.name || 'Member'} />
                <AvatarFallback className="text-xs">
                  {getInitials(member.name)}
                </AvatarFallback>
              </Avatar>
            ))}
            {remainingMembers > 0 && (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary border-2 border-background text-xs font-medium shrink-0">
                +{remainingMembers}
              </div>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button
          variant="ghost"
          className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
        >
          <DollarSign className="mr-2 h-4 w-4" />
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}
