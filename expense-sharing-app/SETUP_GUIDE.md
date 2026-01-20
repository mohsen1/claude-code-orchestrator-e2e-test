# Quick Setup Guide

## Step 1: Install Dependencies

```bash
cd expense-sharing-app
npm install
```

## Step 2: Set Up Google OAuth

### 2.1 Go to Google Cloud Console
Visit: https://console.cloud.google.com/

### 2.2 Create a New Project
1. Click "Select a project" → "New Project"
2. Name it "SplitWise" or similar
3. Click "Create"

### 2.3 Enable Google+ API
1. Search for "Google+ API" in the search bar
2. Click on it and press "Enable"

### 2.4 Create OAuth 2.0 Credentials
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Configure consent screen:
   - Select "External"
   - Enter app name: "SplitWise"
   - Add your email
   - Save and continue
4. Create OAuth client ID:
   - Application type: "Web application"
   - Name: "SplitWise Web Client"
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google`
   - Click "Create"

### 2.5 Copy Credentials
Copy the Client ID and Client Secret from the popup

## Step 3: Create Environment File

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and fill in:

```env
# Generate this with: openssl rand -base64 32
NEXTAUTH_SECRET=your-generated-secret-here

NEXTAUTH_URL=http://localhost:3000

# From Google Cloud Console
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

DATABASE_URL=./data/expenses.db
```

## Step 4: Generate NEXTAUTH_SECRET

Run this command in your terminal:

```bash
openssl rand -base64 32
```

Copy the output and paste it as NEXTAUTH_SECRET in your `.env.local` file.

## Step 5: Create Data Directory

```bash
mkdir -p data
```

## Step 6: Run Development Server

```bash
npm run dev
```

## Step 7: Test the Application

1. Open http://localhost:3000
2. Click "Sign In"
3. Click "Sign in with Google"
4. Authorize the application
5. You should be redirected to the dashboard!

## Troubleshooting

### "Invalid NEXTAUTH_SECRET"
Make sure you generated the secret with `openssl rand -base64 32` and added it to `.env.local`

### "Redirect URI mismatch"
Check that you added `http://localhost:3000/api/auth/callback/google` in Google Cloud Console

### Database errors
Make sure the `data/` directory exists and is writable

### Port already in use
If port 3000 is busy, the app will automatically use the next available port (3001, 3002, etc.)
Make sure to update NEXTAUTH_URL if using a different port

## Production Deployment

When deploying to production:

1. Update NEXTAUTH_URL to your production domain
2. Add your production domain to Google OAuth authorized redirect URIs
3. Use a production database instead of SQLite
4. Keep NEXTAUTH_SECRET secure and never commit it to git

## Next Steps

After authentication is working:

1. Create group management features
2. Implement expense adding/splitting
3. Add Socket.io for real-time updates
4. Build balance calculation logic
5. Add expense history and reporting
