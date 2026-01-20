# Setup Guide - Member Invitation System

This guide will help you set up the member invitation system for your expense-sharing app.

## 1. Environment Variables

Create a `.env` file in your project root:

```env
# Database
DATABASE_PATH=./expenses.db

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Email Service (optional - for production)
RESEND_API_KEY=re_xxxxxxxxxxxxx

# Node Environment
NODE_ENV=development
```

## 2. Install Dependencies

```bash
npm install better-sqlite3 next-auth crypto
```

For TypeScript types:
```bash
npm install -D @types/better-sqlite3
```

For email (optional - Resend):
```bash
npm install resend
```

## 3. Database Initialization

The database will be automatically initialized on first run. The schema includes:

- `groups` - Group information
- `group_members` - Group membership
- `group_invites` - Pending invitations
- `expenses` - Expense records
- `expense_splits` - Individual expense splits
- `settlements` - Payment settlements

## 4. NextAuth Configuration

Make sure you have NextAuth configured in your app. Create `src/app/api/auth/[...nextauth]/route.ts`:

```typescript
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      // Your credentials provider config
    }),
  ],
  // Add other NextAuth configuration
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

## 5. API Route Structure

```
src/app/api/
└── groups/
    └── [id]/
        ├── invite/
        │   ├── route.ts              # POST (create invite), GET (list invites)
        │   └── [code]/
        │       └── route.ts          # GET (validate), DELETE (revoke)
        └── members/
            └── [memberId]/
                ├── route.ts          # GET (details), PATCH (update role), DELETE (remove)
                └── accept/
                    └── route.ts      # POST (accept invite)
```

## 6. Testing the API

### Using curl:

```bash
# Create an invite
curl -X POST http://localhost:3000/api/groups/group-id-123/invite \
  -H "Content-Type: application/json" \
  -d '{"email":"friend@example.com"}'

# Validate an invite
curl http://localhost:3000/api/groups/group-id-123/invite/invite-code-here

# Accept an invite
curl -X POST http://localhost:3000/api/groups/group-id-123/members/invite-code-here/accept

# Remove a member
curl -X DELETE http://localhost:3000/api/groups/group-id-123/members/5
```

## 7. Frontend Integration

See `INVITE_USAGE_EXAMPLES.tsx` for React component examples.

Basic flow:
1. User clicks "Invite Member" button
2. Opens dialog with email input
3. Calls `POST /api/groups/[id]/invite`
4. System sends email with invite link
5. Invitee clicks link
6. System validates with `GET /api/groups/[id]/invite/[code]`
7. Invitee clicks "Accept"
8. System calls `POST /api/groups/[id]/members/[code]/accept`
9. User is added to group

## 8. Email Setup (Production)

The system logs emails to console in development. For production:

### Using Resend:

1. Install Resend:
```bash
npm install resend
```

2. Add to `.env`:
```env
RESEND_API_KEY=re_xxxxxxxxxxxxx
```

3. Uncomment the Resend code in `src/lib/invites.ts`:
```typescript
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'invites@yourdomain.com',
  to: email,
  subject: emailData.subject,
  html: emailData.html
});
```

## 9. Socket.io Integration (Optional)

For real-time updates when members join/leave:

1. Install Socket.io:
```bash
npm install socket.io socket.io-client
```

2. Uncomment Socket.io code in API route files
3. Set up Socket.io server
4. Listen to events on frontend:
```typescript
socket.on('member:joined', (data) => {
  console.log('New member joined:', data);
  // Refresh member list
});
```

## 10. Security Notes

- All routes require authentication via NextAuth
- Invite codes are cryptographically secure (64-character hex)
- Invites expire after 7 days
- Only members can invite others
- Only admins/creators can remove members
- Email must match session user to accept invite
- Database transactions prevent race conditions

## 11. Troubleshooting

### "Unauthorized" errors:
- Make sure NextAuth is properly configured
- Check that user is logged in

### "You are not a member of this group":
- User must be added to group before inviting others
- Check database for correct membership

### Email not sending:
- Check console logs in development
- Verify RESEND_API_KEY in production
- Check email service API status

### "Invalid invitation code":
- Verify the full invite code is being passed
- Check that invite hasn't expired
- Ensure invite wasn't already used

## 12. Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure `NEXTAUTH_URL` with production domain
- [ ] Set up email service (Resend/SendGrid)
- [ ] Enable HTTPS
- [ ] Set up database backups
- [ ] Configure rate limiting
- [ ] Add monitoring/logging
- [ ] Test all invitation flows
- [ ] Set up Socket.io server (if using real-time)

## 13. Database Migrations

If you need to modify the schema later:

```typescript
import { getDb } from '@/lib/db';

const db = getDb();

// Add new column
db.exec(`ALTER TABLE group_invites ADD COLUMN reminder_sent BOOLEAN DEFAULT 0`);

// Create new table
db.exec(`CREATE TABLE ...`);
```

## 14. API Rate Limiting (Recommended)

Add rate limiting to prevent abuse:

```typescript
// In each route file
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10 // 10 requests per window
});
```

## Need Help?

Check the main documentation in `INVITE_API_DOCS.md` for detailed API specs.
