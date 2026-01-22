# SplitSync - Expense Sharing Application

A real-time expense sharing application built with Next.js 16, TypeScript, and SQLite.

## Tech Stack

- **Framework**: Next.js 16.1.4 (App Router)
- **Language**: TypeScript 5.9.3 (strict mode)
- **Database**: SQLite with better-sqlite3 12.6.2
- **ORM**: Drizzle ORM 0.45.1
- **Validation**: Zod 4.3.5
- **Authentication**: NextAuth.js 4.24.13
- **Real-time**: Socket.io 4.8.3
- **Styling**: Tailwind CSS 4.1.18 + shadcn/ui 0.0.4
- **Forms**: React Hook Form 7.71.1
- **Testing**: Vitest 4.0.17

## Project Structure

```
splitsync/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── layout.tsx       # Root layout
│   │   ├── page.tsx         # Home page
│   │   └── globals.css      # Global styles
│   ├── components/          # React components
│   │   └── ui/              # shadcn/ui components
│   ├── lib/                 # Utility libraries
│   │   ├── validations/     # Zod validation schemas
│   │   ├── settlements.ts   # Settlement calculation algorithms
│   │   └── utils.ts         # Utility functions
│   ├── types/               # TypeScript type definitions
│   │   └── index.ts         # Shared types
│   └── styles/              # Additional stylesheets
├── tests/                   # Test files
│   └── setup.ts             # Test setup
├── .env.example             # Environment variables template
├── .eslintrc.json           # ESLint configuration
├── .prettierrc              # Prettier configuration
├── .gitignore               # Git ignore rules
├── next.config.js           # Next.js configuration
├── package.json             # Dependencies and scripts
├── tailwind.config.ts       # Tailwind CSS configuration
├── tsconfig.json            # TypeScript configuration
└── vitest.config.ts         # Vitest configuration
```

## Getting Started

### Prerequisites

- Node.js 20 LTS or higher
- npm 10 or higher

### Installation

1. Copy the `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Update the environment variables in `.env`:
```bash
# Generate a secure secret
openssl rand -base64 32
```

3. Install dependencies:
```bash
npm install
```

### Development

Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

Create a production build:
```bash
npm run build
```

Start the production server:
```bash
npm start
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Create production build
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run typecheck` - Run TypeScript type checking
- `npm run test` - Run tests
- `npm run test:ui` - Run tests with UI
- `npm run test:coverage` - Run tests with coverage report

## Key Features

### Type Safety
- Full TypeScript strict mode enabled
- Comprehensive type definitions in `src/types/index.ts`
- Type-safe database operations with Drizzle ORM
- Runtime validation with Zod schemas

### Money Handling
All monetary values stored as integers (cents) to avoid floating-point precision issues:
```typescript
import { dollarsToCents, formatMoney } from '@/lib/utils';

const amountInCents = dollarsToCents(10.50); // 1050
const formatted = formatMoney(1050); // "$10.50"
```

### Settlement Calculation
Optimized debt settlement algorithm to minimize transactions:
```typescript
import { calculateSettlements } from '@/lib/settlements';

const settlements = calculateSettlements(userBalances);
```

### Validation Schemas
Comprehensive Zod schemas for all input data:
```typescript
import { CreateExpenseSchema } from '@/lib/validations/expense';

const result = CreateExpenseSchema.parse(inputData);
```

## Configuration

### TypeScript
- Strict mode enabled
- Path aliases configured (`@/` maps to `src/`)
- No unchecked indexed access
- No implicit returns

### ESLint
- Next.js recommended rules
- Prettier integration
- TypeScript support

### Prettier
- Single quotes
- Semicolons enabled
- 100 character line width
- Tailwind CSS class sorting

### Tailwind CSS
- shadcn/ui design system
- Dark mode support
- Custom color scheme via CSS variables

## Testing

Vitest is configured with:
- jsdom environment
- React Testing Library
- Coverage reporting
- UI mode for debugging

## Database

SQLite database with Drizzle ORM:
- Type-safe queries
- Automatic migrations
- Connection pooling for production

### Database Commands
```bash
npm run db:generate  # Generate migrations
npm run db:migrate   # Run migrations
npm run db:push      # Push schema changes
npm run db:studio    # Open Drizzle Studio
```

## Security

- Environment-based configuration
- No sensitive data in client-side code
- Secure session management with NextAuth
- Input validation on all API endpoints
- Rate limiting capabilities

## Performance

- Next.js 16 App Router for optimal performance
- Static generation where possible
- Image optimization
- Bundle size optimization
- Efficient settlement algorithms

## License

This project is private and confidential.
