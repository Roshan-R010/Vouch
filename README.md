# Vouch v0.1 — Your purchases, one place

A web application to help you keep track of your online purchases. Sign in with Google, connect Gmail, and see all your supported orders in one dashboard.

## Tech Stack

- **Frontend:** Next.js + React + TypeScript
- **Styling:** Tailwind CSS
- **Auth:** NextAuth.js (Google OAuth)
- **Database:** Supabase (PostgreSQL)
- **Email Parsing:** Cheerio + Node.js
- **Gmail API:** googleapis library
- **Hosting:** Vercel (free tier)

## Project Structure

```
vouch/
├── src/
│   ├── app/              # Next.js app directory (pages)
│   ├── components/       # React components
│   ├── lib/
│   │   ├── api/         # API utility functions
│   │   ├── auth/        # Authentication setup
│   │   ├── db/          # Database queries
│   │   ├── parsers/     # Email parsing logic
│   │   └── types.ts     # TypeScript types
│   └── styles/          # Global CSS
├── public/              # Static assets
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.js
└── postcss.config.js
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy `.env.local.example` to `.env.local` and fill in the values:

```bash
cp .env.local.example .env.local
```

You'll need:
- Google OAuth credentials (from Google Cloud Console)
- Supabase project URL and keys
- NextAuth secret (generate with `openssl rand -base64 32`)

### 3. Set Up Database (Supabase)

- Create a Supabase project at https://supabase.com
- Run the SQL files in `prisma/migrations` in numerical order
- Add credentials to `.env.local`

### 4. Set Up Google OAuth

- Go to [Google Cloud Console](https://console.cloud.google.com)
- Create OAuth 2.0 credentials (Desktop/Web app)
- Add authorized redirect URIs:
  - `http://localhost:3000/api/auth/callback/google` (local)
  - `https://yourdomain.vercel.app/api/auth/callback/google` (production)
- Add credentials to `.env.local`

### 5. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` in your browser.

## v0.1 Goals

- [x] Project structure
- [x] Google authentication
- [ ] Supabase database setup
- [x] Landing page
- [ ] Gmail connection flow
- [ ] Email parsing (Amazon, Flipkart, etc.)
- [ ] Purchase dashboard
- [ ] Error handling & empty states

## Next Steps

1. ~~Implement authentication with NextAuth.js + Google OAuth~~ (done)
2. Create database schema and Supabase setup
3. Build landing and sign-in pages
4. Implement Gmail connection and email search
5. Create email parsers for supported retailers
6. Build the purchase dashboard

## Notes

- Gmail API is free for up to 100 test users
- Stay in "Testing" mode during development to avoid OAuth verification requirements
- Only read purchase-related emails, not the entire inbox
- Never store raw email content—only parsed purchase data

## License

MIT

## Implemented So Far

- Added Google sign-in with NextAuth.js.
- Connected authentication data storage to Supabase through Prisma.
- Added and applied the Prisma database migrations.
- Added the login page, protected dashboard, and sign-out flow.
- Fixed dashboard authentication by removing Prisma from Next.js middleware and checking sessions server-side.
- Added the initial Gmail connection flow with read-only OAuth access and token storage in Supabase.
- Added a live Gmail scanning page that finds purchase-related emails and imports their metadata into `ParsedEmail`.
- Added Amazon email parsing for order IDs, product details, totals, quantity, status, images, and delivery dates.
- Added a purchases dashboard with search, retailer filters, and an expandable purchase-detail overlay.
