# Vouch — Cursor change log

## Google authentication (NextAuth.js + Google OAuth)

### New files
- `src/auth.ts` — NextAuth v5 config: Google provider, Prisma adapter, database sessions, `googleId` / `googleEmail` sync on sign-in, custom sign-in page, session `user.id`.
- `src/lib/db/prisma.ts` — Prisma client singleton for server usage.
- `src/app/api/auth/[...nextauth]/route.ts` — Auth.js HTTP handlers.
- `src/app/dashboard/page.tsx` — Protects the dashboard on the server; unauthenticated users are sent to `/auth/login`.
- `src/types/next-auth.d.ts` — Extends session type with `user.id`.
- `src/components/GoogleSignInButton.tsx` — Client button; `signIn('google', { callbackUrl: '/dashboard' })`.
- `src/components/LoginPage.tsx` — Split login/sign-up UI (design reference).
- `src/app/auth/login/page.tsx` — Login route; redirects to `/dashboard` if already signed in.
- `src/app/dashboard/page.tsx` — Post-login placeholder with sign-out.
- `prisma/migrations/002_verification_token/migration.sql` — Adds `VerificationToken` table for `@auth/prisma-adapter`.

### Modified files
- `prisma/schema.prisma` — Added `VerificationToken` model.
- `src/components/LandingPage.tsx` — Navbar **Sign up** and **Get started** link to `/auth/login`.
- `.env.local.example` — Added `DATABASE_URL`, `AUTH_SECRET`; clarified Google OAuth vars.
- `package.json` — `@auth/prisma-adapter` dependency (via npm install).

### Routing
| Path | Purpose |
|------|---------|
| `/` | Landing page |
| `/auth/login` | Login / sign-up screen (Google) |
| `/api/auth/*` | NextAuth endpoints |
| `/dashboard` | Protected post-login page |

### Login UI (design)
- **Left:** `#ff5961` panel — `vouch.` logo, welcome copy, floating headphones, three product cards, footer line.
- **Right:** `#fffaf4` panel — “New to Vouch? Sign up”, “Welcome back to Vouch” heading, **Continue with Google**, divider, Terms/Privacy footer.
- Fonts: Cherry Swash, Arvo, DM Sans (same as landing page).

### Environment variables (required for auth)
Copy `.env.local.example` → `.env.local` and set:
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` — [Google Cloud Console](https://console.cloud.google.com) OAuth client; redirect URI: `http://localhost:3000/api/auth/callback/google`
- `NEXTAUTH_URL=http://localhost:3000`
- `NEXTAUTH_SECRET` or `AUTH_SECRET` — e.g. `openssl rand -base64 32`
- `DATABASE_URL` — Supabase PostgreSQL URL (see `SETUP_SUPABASE.md`)

### Database
Run migrations after pulling these changes:
```bash
npm run prisma:migrate
# or apply prisma/migrations/002_verification_token/migration.sql in Supabase SQL editor
npm run prisma:generate
```

### How to verify locally
1. `npm install`
2. Configure `.env.local`
3. Apply DB migrations
4. `npm run dev`
5. Open `http://localhost:3000` → **Get started** or **Sign up** → `/auth/login`
6. Click **Continue with Google** → Google consent → `/dashboard`
7. Sign out returns to home; visiting `/dashboard` while logged out redirects to login

### Runtime note

Dashboard protection is performed in the server page rather than Next.js middleware. This keeps the Prisma adapter out of the Edge runtime, where it cannot execute reliably.
