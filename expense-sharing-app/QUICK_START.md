# Quick Start Guide - SplitWise Expense Sharing App

## ⚡ Quick Setup (5 minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Generate Secret & Set Environment
```bash
# Generate a secure secret
openssl rand -base64 32

# Create environment file
cp .env.local.example .env.local
```

### 3. Get Google OAuth Credentials

**Quick Setup:**
1. Visit https://console.cloud.google.com/
2. Create new project "SplitWise"
3. Enable "Google+ API" (search in API library)
4. Go to "Credentials" → "Create Credentials" → "OAuth client ID"
5. Application type: "Web application"
6. Name: "SplitWise Dev"
7. Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
8. Copy Client ID and Client Secret

### 4. Configure .env.local
```env
NEXTAUTH_SECRET=<paste-your-generated-secret>
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=<paste-your-client-id>
GOOGLE_CLIENT_SECRET=<paste-your-client-secret>
DATABASE_URL=./data/expenses.db
```

### 5. Run the App
```bash
mkdir -p data
npm run dev
```

### 6. Test Authentication
1. Open http://localhost:3000
2. Click "Sign In"
3. Click "Sign in with Google"
4. Authorize the app
5. You should see the dashboard!

## 🎯 What's Working

✅ **Authentication System**
- Google OAuth login/logout
- Session management
- Protected routes
- User profile display

✅ **Pages**
- `/` - Landing page
- `/login` - Login page with Google OAuth
- `/dashboard` - Protected user dashboard

✅ **Database**
- SQLite database with User, Session, Account tables
- Pre-created tables for Groups and Expenses

✅ **Security**
- NextAuth.js with secure session tokens
- Middleware route protection
- CSRF protection

## 📝 Next Steps

After authentication is working, you can build:

1. **Group Management**
   - Create/delete expense groups
   - Add/remove members
   - Group list view

2. **Expense Tracking**
   - Add new expenses
   - Split expenses equally
   - Expense history

3. **Balance Calculations**
   - Calculate who owes what
   - Show balance summary
   - Settlement suggestions

4. **Real-time Updates**
   - Socket.io integration
   - Live expense updates
   - Notification system

## 🔧 Common Issues

### "Invalid NEXTAUTH_SECRET"
- Make sure you generated with: `openssl rand -base64 32`
- Check it's in `.env.local` (not just .env.local.example)

### "Redirect URI mismatch"
- Verify the redirect URI in Google Console exactly matches:
  `http://localhost:3000/api/auth/callback/google`

### Database errors
- Create data directory: `mkdir -p data`
- Check DATABASE_URL in `.env.local`

### Port 3000 already in use
- Next.js will automatically use 3001, 3002, etc.
- Update NEXTAUTH_URL if using different port

## 📚 Additional Documentation

- **README.md** - Full project documentation
- **SETUP_GUIDE.md** - Detailed setup with screenshots
- **IMPLEMENTATION_SUMMARY.md** - Technical details

## 🚀 Production Deployment

For production deployment:

1. Update environment variables:
   ```env
   NEXTAUTH_URL=https://your-domain.com
   NEXTAUTH_SECRET=<production-secret>
   ```

2. Add production domain to Google OAuth redirect URIs

3. Consider migrating from SQLite to PostgreSQL/MySQL

4. Deploy to Vercel, Railway, or Render

## 💡 Development Tips

- Database file location: `./data/expenses.db`
- Session data: Stored in database, not cookies
- Logs: Check terminal for errors
- Hot reload: Enabled in development
- TypeScript: Strict mode enabled

## 🐛 Debugging

If something doesn't work:

1. Check browser console for errors
2. Check terminal for server errors
3. Verify `.env.local` is configured correctly
4. Ensure Google OAuth credentials are correct
5. Try clearing browser cookies and cache
6. Delete `data/expenses.db` and restart to reinitialize database

## ✨ Ready to Build!

Your authentication system is ready. Now you can focus on building the expense sharing features!
