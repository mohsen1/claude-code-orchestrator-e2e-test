'use client';

import React, { useState } from 'react';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { GroupCard, Group } from '@/components/dashboard/group-card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

// Mock data - replace with actual data fetching
const mockGroups: Group[] = [
  {
    id: '1',
    name: 'Apartment Expenses',
    netBalance: 125.50,
    memberCount: 4,
    members: [
      { id: '1', name: 'Alex Johnson' },
      { id: '2', name: 'Sam Smith' },
      { id: '3', name: 'Jordan Lee' },
      { id: '4', name: 'Taylor Brown' },
    ],
    lastActivity: new Date(Date.now() - 3600000), // 1 hour ago
  },
  {
    id: '2',
    name: 'Road Trip 2024',
    netBalance: -75.25,
    memberCount: 3,
    members: [
      { id: '5', name: 'Chris Davis' },
      { id: '6', name: 'Morgan Wilson' },
      { id: '7', name: 'Casey Miller' },
    ],
    lastActivity: new Date(Date.now() - 86400000), // 1 day ago
  },
  {
    id: '3',
    name: 'Office Lunch Club',
    netBalance: 0,
    memberCount: 6,
    members: [
      { id: '8', name: 'Jamie Garcia' },
      { id: '9', name: 'Riley Martinez' },
      { id: '10', name: 'Quinn Anderson' },
      { id: '11', name: 'Avery Thompson' },
      { id: '12', name: 'Blake White' },
      { id: '13', name: 'Drew Harris' },
    ],
    lastActivity: new Date(Date.now() - 172800000), // 2 days ago
  },
  {
    id: '4',
    name: 'Vacation Rental',
    netBalance: 340.00,
    memberCount: 5,
    members: [
      { id: '14', name: 'Jordan Taylor' },
      { id: '15', name: 'Skyler Brown' },
      { id: '16', name: 'Reese Davis' },
      { id: '17', name: 'Charlie Miller' },
      { id: '18', name: 'Alex Wilson' },
    ],
    lastActivity: new Date(Date.now() - 259200000), // 3 days ago
  },
  {
    id: '5',
    name: 'Weekly Groceries',
    netBalance: -28.75,
    memberCount: 2,
    members: [
      { id: '19', name: 'Sam Parker' },
      { id: '20', name: 'Taylor Lee' },
    ],
    lastActivity: new Date(Date.now() - 43200000), // 12 hours ago
  },
];

export default function DashboardPage() {
  const [groups, setGroups] = useState<Group[]>(mockGroups);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');

  const handleCreateGroup = () => {
    setIsCreateDialogOpen(true);
  };

  const handleSettleUp = () => {
    // TODO: Implement settle up functionality
    console.log('Settle up clicked');
  };

  const handleCreateGroupSubmit = () => {
    if (!newGroupName.trim()) return;

    const newGroup: Group = {
      id: Date.now().toString(),
      name: newGroupName,
      netBalance: 0,
      memberCount: 1,
      members: [
        {
          id: 'current-user',
          name: 'You',
        },
      ],
      lastActivity: new Date(),
    };

    setGroups([newGroup, ...groups]);
    setNewGroupName('');
    setIsCreateDialogOpen(false);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <DashboardHeader
        onCreateGroup={handleCreateGroup}
        onSettleUp={handleSettleUp}
      />

      {groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="bg-muted rounded-full p-6 mb-4">
            <Plus className="h-12 w-12 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No groups yet</h2>
          <p className="text-muted-foreground text-center mb-6 max-w-md">
            Create your first expense group to start tracking shared expenses with friends and family.
          </p>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg">
                <Plus className="mr-2 h-5 w-5" />
                Create Your First Group
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a new group</DialogTitle>
                <DialogDescription>
                  Give your group a name to get started with tracking expenses.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="group-name">Group Name</Label>
                  <Input
                    id="group-name"
                    placeholder="e.g., Apartment Expenses"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateGroupSubmit()}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateGroupSubmit}>Create Group</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {groups.map((group) => (
              <GroupCard key={group.id} group={group} />
            ))}
          </div>

          {/* Create Group Dialog */}
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a new group</DialogTitle>
                <DialogDescription>
                  Give your group a name to get started with tracking expenses.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="group-name">Group Name</Label>
                  <Input
                    id="group-name"
                    placeholder="e.g., Apartment Expenses"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateGroupSubmit()}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateGroupSubmit}>Create Group</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
