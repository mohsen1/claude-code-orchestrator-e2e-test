import { Suspense } from 'react'
import { GroupList } from '@/components/dashboard/group-list'
import { Button } from '@/components/ui/button'
import { PlusIcon } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-50 mb-2">
              Dashboard
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Manage your expense groups and track shared expenses
            </p>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2">
                <PlusIcon className="h-5 w-5" />
                Create Group
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Group</DialogTitle>
                <DialogDescription>
                  Create a new group to start sharing expenses with friends or family.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Group Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Roommates, Family Trip"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Input
                    id="description"
                    placeholder="Brief description of the group"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Create Group</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Groups Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-50 mb-4">
            Your Groups
          </h2>
          <Suspense fallback={<GroupLoadingState />}>
            <GroupList />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

function GroupLoadingState() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-48 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse"
        />
      ))}
    </div>
  )
}
