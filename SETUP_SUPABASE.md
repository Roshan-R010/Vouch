# Supabase Setup Guide for Vouch v0.1

## Quick Start

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose:
   - Organization: Create new or select existing
   - Project name: `vouch` (or your preference)
   - Database password: Create a strong password (save it!)
   - Region: Choose closest to you (e.g., Singapore for India users)
   - Pricing plan: Free tier is fine for v0.1

4. Wait for project to initialize (2-3 minutes)

### 2. Get Your Credentials

Once your project is ready:

1. Go to **Settings** → **Database**
2. Copy the connection string (PostgreSQL)
3. Go to **Settings** → **API**
4. Copy:
   - `Project URL` (your Supabase URL)
   - `anon public` key (NEXT_PUBLIC_SUPABASE_ANON_KEY)
   - `service_role` secret key (SUPABASE_SERVICE_ROLE_KEY)

### 3. Update .env.local

```bash
# Replace with your actual values
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
DATABASE_URL=postgresql://postgres:PASSWORD@db.your-project.supabase.co:5432/postgres
```

### 4. Run the Migrations

Two options:

#### Option A: Use Supabase Dashboard (Easiest)

1. Go to **SQL Editor** in your Supabase dashboard
2. Click "New Query"
3. Copy the entire contents of `prisma/migrations/001_init/migration.sql`
4. Paste it into the query editor
5. Click "Run"

#### Option B: Use Prisma CLI

```bash
npm install
npm run prisma:migrate
```

(This requires DATABASE_URL to be set correctly)

### 5. Verify Tables Were Created

In Supabase dashboard:
- Go to **Table Editor**
- You should see:
  - `User`
  - `Account`
  - `Session`
  - `Purchase`
  - `ParsedEmail`
  - `GmailSync`

## Database Schema Explanation

### User
- Stores user accounts
- Linked to Google OAuth
- Stores Gmail access tokens (refreshed automatically)

### Account, Session
- NextAuth.js tables for authentication
- Automatically managed by NextAuth

### Purchase
- Core table: stores discovered purchases
- Links to users who own them
- Stores order details, images, warranty info
- indexed by userId, retailer, orderDate for fast queries

### ParsedEmail
- Intermediate table: stores raw email parsing results
- Before creating a Purchase record, email is parsed and stored here
- Helps with debugging and re-parsing if needed
- Can be cleaned up after processing

### GmailSync
- Tracks Gmail synchronization progress
- Stores last sync time and history ID
- Helps resume syncs without reprocessing old emails

## Ready to Use

Your database is now ready for:
1. User authentication
2. Gmail integration
3. Email parsing
4. Purchase storage

Next steps:
1. Set up authentication (NextAuth + Google OAuth)
2. Test Gmail API connection
3. Build email parsers for each retailer

## Troubleshooting

### Connection Error?
- Check DATABASE_URL format
- Verify IP allowlist (Supabase auto-allows all during free tier)
- Ensure password is correct

### Migration Failed?
- Check Supabase project status
- Look at SQL error message
- Try running in smaller chunks

### Need Help?
- Supabase docs: https://supabase.com/docs
- Check Supabase logs in dashboard
