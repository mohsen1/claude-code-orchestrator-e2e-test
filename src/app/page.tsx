export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm">
        <div className="text-center">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            SplitEase
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Simple expense-sharing app for groups
          </p>
          <div className="flex gap-4 justify-center">
            <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
              Get Started
            </button>
            <button className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors">
              Learn More
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <div className="p-6 border rounded-lg bg-card">
            <h3 className="text-lg font-semibold mb-2">Create Groups</h3>
            <p className="text-muted-foreground">
              Easily create groups with friends, family, or roommates to track shared expenses.
            </p>
          </div>
          <div className="p-6 border rounded-lg bg-card">
            <h3 className="text-lg font-semibold mb-2">Add Expenses</h3>
            <p className="text-muted-foreground">
              Log expenses and automatically split them equally among group members.
            </p>
          </div>
          <div className="p-6 border rounded-lg bg-card">
            <h3 className="text-lg font-semibold mb-2">Track Balances</h3>
            <p className="text-muted-foreground">
              See who owes whom and keep track of your shared expenses effortlessly.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
