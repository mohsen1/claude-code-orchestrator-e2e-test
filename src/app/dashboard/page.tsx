'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/dashboard/Header';
import { GroupList } from '@/components/dashboard/GroupList';
import { useRouter } from 'next/navigation';

// Mock data - replace with actual API calls
const mockGroups = [
  {
    id: '1',
    name: 'Apartment 4B',
    description: 'Monthly expenses for our shared apartment',
    memberCount: 4,
    balance: 125.50,
    currency: 'USD',
    members: [
      { id: '1', name: 'John Doe', image: null },
      { id: '2', name: 'Jane Smith', image: null },
      { id: '3', name: 'Bob Johnson', image: null },
      { id: '4', name: 'Alice Brown', image: null },
    ],
  },
  {
    id: '2',
    name: 'Hawaii Trip 2024',
    description: 'Summer vacation with college friends',
    memberCount: 6,
    balance: -89.25,
    currency: 'USD',
    members: [
      { id: '5', name: 'Mike Wilson', image: null },
      { id: '6', name: 'Sarah Davis', image: null },
      { id: '7', name: 'Tom Miller', image: null },
    ],
  },
  {
    id: '3',
    name: 'Office Lunch Club',
    description: 'Weekly team lunches',
    memberCount: 8,
    balance: 45.00,
    currency: 'USD',
    members: [
      { id: '8', name: 'Chris Taylor', image: null },
      { id: '9', name: 'Emma Anderson', image: null },
      { id: '10', name: 'David Martinez', image: null },
      { id: '11', name: 'Lisa Garcia', image: null },
    ],
  },
];

const mockUser = {
  name: 'Demo User',
  email: 'demo@example.com',
  image: null,
};

export default function DashboardPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<typeof mockGroups>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    const loadData = async () => {
      // Replace with actual API call
      // const response = await fetch('/api/groups');
      // const data = await response.json();

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      setGroups(mockGroups);
      setIsLoading(false);
    };

    loadData();
  }, []);

  const handleCreateGroup = async (data: { name: string; description: string }) => {
    // Replace with actual API call
    // const response = await fetch('/api/groups', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(data),
    // });

    // Mock implementation
    const newGroup = {
      id: String(groups.length + 1),
      name: data.name,
      description: data.description,
      memberCount: 1,
      balance: 0,
      currency: 'USD' as const,
      members: [mockUser],
    };

    setGroups([newGroup, ...groups]);
  };

  const handleGroupClick = (groupId: string) => {
    router.push(`/dashboard/groups/${groupId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header user={mockUser} />

      <main className="container px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <GroupList
          groups={groups}
          isLoading={isLoading}
          onCreateGroup={handleCreateGroup}
          onGroupClick={handleGroupClick}
        />
      </main>
    </div>
  );
}
