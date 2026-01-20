export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Your Groups</h2>
            <p className="text-muted-foreground">No groups yet. Create your first group to start tracking expenses!</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Your Balances</h2>
            <p className="text-muted-foreground">You're all settled up!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
