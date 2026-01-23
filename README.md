# SplitSync

A modern expense sharing application similar to Splitwise, built with Next.js 16, TypeScript, Drizzle ORM, and Socket.io for real-time updates.

## Features

- **User Authentication**: Secure login with session management and password hashing
- **Group Management**: Create and manage expense-sharing groups
- **Expense Tracking**: Track who paid, split types, amounts, dates, and categories
- **Multiple Split Methods**: Equal splits, exact amounts, percentages, and shares
- **Balance Calculations**: Automatically calculate who owes whom
- **Settlement Tracking**: Track partial and full settlements
- **Real-time Updates**: WebSocket integration via Socket.io for instant updates
- **Activity Feed**: Complete history of all expense activities
- **Responsive Design**: Modern UI with Tailwind CSS and shadcn/ui

## Tech Stack

- **Framework**: Next.js 16.1.4 with App Router
- **Language**: TypeScript 5.9.3
- **Database**: SQLite with Drizzle ORM
- **Real-time**: Socket.io
- **Styling**: Tailwind CSS + shadcn/ui
- **Testing**: Playwright for E2E testing
- **Authentication**: bcryptjs for secure password hashing
- **Validation**: Zod for runtime type validation

## Prerequisites

- Node.js 18.18.0 or higher
- npm 9.0.0 or higher

## Getting Started

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd splitsync
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Initialize the database:
```bash
npm run db:push
```

### Development

Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

Build the application:
```bash
npm run build
```

Start the production server:
```bash
npm start
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:push` - Push database schema changes
- `npm run db:studio` - Open Drizzle Studio for database inspection
- `npm run db:migrate` - Run database migrations
- `npm test` - Run Playwright E2E tests
- `npm run test:ui` - Run tests with UI
- `npm run test:headed` - Run tests in headed mode

## Docker Deployment

Build the Docker image:
```bash
docker build -t splitsync:latest .
```

Run the container:
```bash
docker run -p 3000:3000 -v $(pwd)/data:/app/data splitsync:latest
```

## License

This project is licensed under the MIT License.
