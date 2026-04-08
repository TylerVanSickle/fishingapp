# HookLine — Project Guide

## What is this?
HookLine is a nationwide US fishing app built for acquisition by an outdoor company. It's a Next.js 15 App Router + Supabase + Mapbox app with Stripe subscriptions and Capacitor for native mobile.

**Live URL:** https://hooklines.vercel.app
**Repo:** https://github.com/TylerVanSickle/fishingapp

## Tech Stack
- **Frontend:** Next.js 15 (App Router, server components, server actions)
- **Database/Auth:** Supabase (Postgres, RLS, auth with email confirmation)
- **Maps:** Mapbox GL JS
- **Payments:** Stripe (subscriptions — $9.99/mo or $79.99/yr)
- **Hosting:** Vercel
- **Native:** Capacitor (points webview at Vercel URL, not local build)
- **Styling:** Tailwind CSS v4, dark theme (#060d1a background)
- **Icons:** Lucide React

## Key Architecture Decisions
- **Middleware is Edge runtime** — NO database queries in middleware. Only JWT auth check. Onboarding/ban checks happen in layout/pages.
- **Stripe lazy init via Proxy** — `src/lib/stripe.ts` uses a Proxy so Stripe doesn't crash at build time when env vars aren't available.
- **Server actions for mutations** — all data writes go through `src/lib/actions/*.ts`
- **Supabase types are loose** — many queries use `Record<string, unknown>` casts. When you need to access fields in JSX, create a typed interface and cast through `unknown`.
- **Service worker** — `public/sw.js` handles push notifications ONLY. Do NOT add a fetch handler (it breaks navigation).
- **No dangerouslySetInnerHTML in layout** — causes React hydration crashes (insertBefore/removeChild errors). Use client components with React state instead.

## Project Structure
```
src/
├── app/                    # Next.js pages
│   ├── admin/              # Admin panel (dashboard, spots, catches, users, reports, contact)
│   ├── anglers/[id]/       # Public angler profiles
│   ├── api/                # API routes (stripe checkout/webhook/portal, push subscribe)
│   ├── auth/callback/      # Supabase email confirm handler
│   ├── banned/             # Shown to banned/suspended users
│   ├── catches/[id]/       # Individual catch pages
│   ├── contact/            # Contact form + FAQ
│   ├── explore/            # Discovery/trending page
│   ├── feed/               # Social feed with comments, reactions, guest gate
│   ├── fish/[id]/          # Species guide
│   ├── forecast/           # Solunar fishing forecast
│   ├── gear/               # Pro: gear tracker
│   ├── journal/            # Pro: fishing journal
│   ├── leaderboard/        # Top anglers/catches
│   ├── log-catch/          # Catch logging form (weight max 1500, length max 240)
│   ├── map/                # Mapbox interactive map
│   ├── notifications/      # Notification center + push subscribe button
│   ├── onboarding/         # 3-step wizard (state, species, techniques)
│   ├── pro/                # Pro subscription page + /pro/manage
│   ├── profile/            # User profile + edit
│   ├── spots/[id]/         # Fishing spot pages
│   ├── submit-spot/        # Add new spot (accepts ?lat=&lng=&name= from map)
│   ├── trips/              # Trip planning
│   ├── welcome/            # Post-signup welcome page
│   ├── privacy/            # Privacy policy
│   ├── terms/              # Terms of service
│   ├── layout.tsx          # Root layout — navbar, mobile nav, splash screen, analytics
│   ├── page.tsx            # Landing page
│   └── loading.tsx         # Root loading with HookSpinner
├── components/
│   ├── ui/                 # Skeleton, Toaster, Select, HookSpinner
│   ├── AdminNav.tsx        # Client component for admin sidebar + mobile tabs (active state)
│   ├── BlockButton.tsx     # Block/unblock users
│   ├── ContactForm.tsx     # Contact form (saves to Supabase, not email)
│   ├── FeedComments.tsx    # Inline comments on feed posts
│   ├── GuestFeedGate.tsx   # Blurred signup wall for logged-out users
│   ├── MapView.tsx         # Main Mapbox map component
│   ├── MobileNav.tsx       # Bottom tab bar (Map/Feed/Log/Alerts/More)
│   ├── Navbar.tsx          # Desktop nav (server component)
│   ├── NavLinks.tsx        # Client component for active link highlighting
│   ├── NavMore.tsx         # Desktop "More" dropdown with active state
│   ├── OnboardingWizard.tsx # 3-step onboarding
│   ├── PushSubscribeButton.tsx # Web Push toggle
│   ├── SplashScreen.tsx    # PWA splash with hook draw animation
│   ├── StripeButtons.tsx   # Checkout + Manage subscription buttons
│   └── TopLoader.tsx       # Blue progress bar on navigation
├── lib/
│   ├── actions/            # Server actions
│   │   ├── admin.ts        # Ban, suspend, warn, delete content, toggle admin
│   │   ├── catches.ts      # Delete/update catches
│   │   ├── contact.ts      # Insert into contact_submissions table
│   │   ├── onboarding.ts   # Complete onboarding → redirect to /welcome
│   │   ├── reports.ts      # Fishing reports
│   │   ├── social.ts       # Block, follow, comments, reactions, push notifications
│   │   ├── spots.ts        # Submit/approve/reject spots
│   │   └── trips.ts        # Trip CRUD
│   ├── supabase/           # Supabase client/server helpers
│   ├── push.ts             # Web Push via web-push package
│   ├── stripe.ts           # Stripe lazy init (Proxy pattern)
│   ├── fishingScore.ts     # Solunar score calculation
│   └── contentFilter.ts    # Basic profanity filter
└── middleware.ts            # Auth gate — public: /, /map, /login, /signup, /pro, /banned, /privacy, /terms
```

## Auth Flow
1. Sign up → email confirm → `/auth/callback` → `/onboarding` (3 steps) → `/welcome`
2. Login → `/map`
3. Banned/suspended users → `/banned`
4. Logged-out users can only see: `/`, `/map`, `/login`, `/signup`, `/pro`, `/privacy`, `/terms`

## Supabase Tables (key ones)
- `profiles` — id, username, avatar_url, bio, home_state, is_admin, is_pro, is_banned, is_suspended, suspended_until, ban_reason, warn_count, stripe_customer_id, stripe_subscription_id
- `spots` — fishing spots with lat/lng, approval workflow
- `catches` — logged catches with species, weight, length, photo, visibility
- `fish_species` — species reference data
- `follows` — follower_id/following_id
- `user_blocks` — blocker_id/blocked_id
- `catch_comments`, `spot_comments` — comments with is_deleted
- `catch_reactions` — emoji reactions
- `notifications` — in-app notifications
- `push_subscriptions` — web push endpoints
- `contact_submissions` — contact form entries (admin reads in /admin/contact)
- `admin_actions` — moderation audit log
- `content_reports`, `comment_reports` — user reports for moderation

## Migrations to Run
These SQL files in `supabase/` need to be run in the Supabase SQL editor:
- `migration_v13_techniques.sql` — preferred_techniques column
- `migration_v14_contact.sql` — contact_submissions table
- `migration_v15_push.sql` — push_subscriptions table
- `migration_v16_moderation.sql` — user_blocks, moderation columns, admin_actions

## Environment Variables
```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_MONTHLY_PRICE_ID=
STRIPE_ANNUAL_PRICE_ID=

# Mapbox
NEXT_PUBLIC_MAPBOX_TOKEN=

# App
NEXT_PUBLIC_APP_URL=https://hooklines.vercel.app  # ← update on Vercel too

# Web Push (VAPID)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_MAILTO=mailto:bubbavansmack29@gmail.com
```

## Common Gotchas
1. **TypeScript build errors** — Supabase select("*") returns `Record<string, unknown>`. Create typed interfaces and cast: `const x = data as unknown as MyType;`
2. **Stripe build crash** — Never import Stripe at module top level. Use the Proxy in `src/lib/stripe.ts`.
3. **Middleware crashes** — NO Supabase DB queries. Edge runtime doesn't support them. Only JWT refresh.
4. **Service worker** — Only push + notificationclick handlers. No fetch handler.
5. **useSearchParams** — Must be wrapped in `<Suspense>` or it crashes the page.
6. **Hydration errors** — Don't use `dangerouslySetInnerHTML` in the root layout or manipulate DOM outside React.

## Mobile
- **PWA** works via Add to Home Screen in Safari/Chrome
- **Capacitor** config at `capacitor.config.ts` — points at `https://hooklines.vercel.app`
- Android icons generated in `android/app/src/main/res/mipmap-*/`
- Play Store listing in progress, iOS needs a Mac with Xcode

## Admin Panel
Accessible at `/admin` for users with `is_admin = true`. Features:
- Dashboard with stats
- Spot approval/rejection workflow
- Catch management
- User management (ban/suspend/warn/delete content/admin toggle)
- Report moderation (comment + content reports)
- Contact submission inbox with mark-as-read

## Pricing
- Free tier: core features (map, catch logging, feed, spots, species guide)
- Pro ($9.99/mo or $79.99/yr): gear tracker, journal, where-to-fish AI, species targeting

## Stripe Setup
- Customer Portal must be enabled in Stripe Dashboard (Settings → Billing → Customer portal)
- Webhook endpoint: `/api/stripe/webhook` — needs STRIPE_WEBHOOK_SECRET
- Products need to be active in Stripe with correct price IDs matching env vars
