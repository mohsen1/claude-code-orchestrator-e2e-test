export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="max-w-5xl w-full text-center">
        <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          SplitWise
        </h1>
        <p className="text-2xl text-muted-foreground mb-8">
          Track shared expenses and settle debts with friends
        </p>
        <div className="flex gap-4 justify-center">
          <button className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity">
            Get Started
          </button>
          <button className="px-8 py-3 border border-input rounded-lg font-medium hover:bg-secondary transition-colors">
            Learn More
          </button>
        </div>
      </div>
    </main>
  );
}
