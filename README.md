# SplitSync 💰

A modern expense sharing application built with Next.js 16, TypeScript, Drizzle ORM, Socket.io, and Tailwind CSS. SplitSync helps groups track shared expenses, calculate balances, and settle up with real-time updates.

## 🌟 Features

- **User Authentication**: Secure JWT-based authentication with bcrypt password hashing
- **Group Management**: Create and manage expense groups with multiple members
- **Expense Tracking**: Add, edit, and categorize shared expenses
- **Balance Calculations**: Automatic balance tracking showing who owes whom
- **Settlements**: Track and record payments between group members
- **Real-time Updates**: Live updates via Socket.io when expenses or settlements change
- **Responsive Design**: Beautiful, mobile-friendly UI built with Tailwind CSS

## 🛠️ Tech Stack

### Frontend
- **Next.js 16**: React framework with server components and app router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Radix UI**: Accessible UI components
- **Lucide Icons**: Beautiful icon library

### Backend
- **Next.js API Routes**: Serverless API endpoints
- **Drizzle ORM**: Type-safe database ORM
- **PostgreSQL**: Relational database
- **Socket.io**: Real-time bidirectional communication

### DevOps
- **Docker**: Containerization
- **GitHub Actions**: CI/CD pipeline
- **ESLint**: Code linting
- **TypeScript**: Static type checking

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **PostgreSQL** >= 14.0
- **Git**

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/splitsync.git
cd splitsync
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Update `.env` with your configuration:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/splitsync
JWT_SECRET=your-super-secret-jwt-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Set Up the Database

Create a PostgreSQL database:
```bash
createdb splitsync
```

Generate and run database migrations:
```bash
npm run db:generate
npm run db:push
```

### 5. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📚 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type check
- `npm run db:generate` - Generate database migrations
- `npm run db:push` - Push database schema
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Drizzle Studio

## 🏗️ Project Structure

```
splitsync/
├── .github/
│   └── workflows/
│       └── ci.yml          # GitHub Actions CI/CD pipeline
├── src/
│   ├── app/                # Next.js app router pages
│   ├── components/         # React components
│   ├── lib/                # Utility functions and configurations
│   └── db/                 # Database schema and queries
├── .env.example            # Example environment variables
├── .gitignore              # Git ignore rules
├── Dockerfile              # Docker configuration
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
└── README.md               # This file
```

## 🐳 Docker Deployment

Build the Docker image:
```bash
docker build -t splitsync .
```

Run the container:
```bash
docker run -p 3000:3000 \
  -e DATABASE_URL=postgresql://user:password@host:5432/splitsync \
  -e JWT_SECRET=your-secret \
  splitsync
```

Use Docker Compose for easier local development:
```bash
docker-compose up -d
```

## 🔄 CI/CD Pipeline

The project uses GitHub Actions for continuous integration and deployment:

1. **Lint & Type Check**: Validates code quality and type safety
2. **Build**: Creates production build
3. **Test**: Runs automated tests with PostgreSQL
4. **Docker Build**: Creates Docker image
5. **Security Scan**: Checks for vulnerabilities
6. **Deploy**: Deploys to staging/production

## 🧪 Testing

Run the test suite:
```bash
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

## 📝 Database Schema

The application uses the following main entities:
- **Users**: Application users
- **Groups**: Expense sharing groups
- **Group Members**: Association between users and groups
- **Expenses**: Shared expenses within groups
- **Expense Splits**: How expenses are divided among members
- **Settlements**: Payments between users

## 🔒 Security Features

- Password hashing with bcryptjs
- JWT token-based authentication
- CORS protection
- Rate limiting on API endpoints
- Input validation with Zod
- SQL injection prevention with parameterized queries

## 🌐 Environment Variables

See `.env.example` for all available configuration options:

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `JWT_SECRET` | Secret for JWT tokens | Required |
| `NEXT_PUBLIC_APP_URL` | Application URL | `http://localhost:3000` |
| `SOCKET_PORT` | Socket.io server port | `3001` |

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [Radix UI](https://www.radix-ui.com/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons by [Lucide](https://lucide.dev/)

## 📞 Support

For support, email support@splitsync.app or open an issue on GitHub.

---

Made with ❤️ by the SplitSync team
