# HookLine — The National Fishing Community App

> Discover fishing spots, log catches, track your personal bests, and connect with anglers across all 50 states.

---

## What is HookLine?

HookLine is a full-stack fishing community app built for serious anglers. It combines interactive spot discovery, catch logging, social features, and AI-driven fishing intelligence into one clean, mobile-first experience.

The free tier gives every angler a powerful set of tools — no ads, no paywalls on the map. HookLine Pro unlocks the intelligence layer: real-time spot recommendations, solunar forecasts, catch pattern analysis, and more.

---

## Features

### Free (for everyone)
- 🗺️ **Interactive Spot Map** — thousands of fishing spots across every US state, filterable by water type, species, and activity level
- 🎣 **Catch Logging** — species, weight, length, bait, photos, GPS location, and visibility controls
- 📸 **Photo Uploads** — attach photos to catches and spots
- 👥 **Social Feed** — follow anglers, react to catches, see what's biting near you
- 💬 **Comments & Reactions** — engage with the community on catches and spots
- 🏆 **Leaderboards** — weekly and all-time rankings by state and species
- ⭐ **Spot Ratings & Reviews** — community-verified spot quality
- 📖 **Species Encyclopedia** — reference guide for 50+ fish species
- 🌤️ **Basic Fishing Forecast** — solunar timing and conditions overview

### Pro ($9.99/mo · $79.99/yr)
- 📍 **Where to Fish** — real-time spot recommendations ranked by solunar timing, weather, technique match, and community catch data
- 🧠 **Catch Pattern Analysis** — personalized insights on your best times, baits, and conditions
- 📅 **Fishing Calendar** — full-year heatmap of your fishing activity
- ⚡ **Solunar Forecast** — hyper-accurate feeding window predictions for any location
- 🐟 **Technique Intelligence** — spot rankings filtered to your specific fishing style
- 📊 **Personal Bests Tracker** — deep stats on your top catches per species
- 📓 **Fishing Journal** — private outing notes with conditions and gear
- 🔧 **Gear & Tackle Tracker** — save rod/reel setups and tag catches to gear
- 🎯 **Species Targeting Intel** — best hours, top baits, and proven patterns per species
- 📈 **7-Day Fishing Forecast** — full week solunar outlook and hourly breakdown
- 🗺️ **Advanced Trip Planner** — plan full trips with species targets, gear notes, and solunar windows
- 🏅 **Personal Records** — trophy wall with gold/silver/bronze rankings per species

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Database | Supabase (PostgreSQL + RLS) |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| Maps | Mapbox GL JS |
| Payments | Stripe (subscriptions) |
| Mobile | Capacitor (iOS + Android) |
| Styling | Tailwind CSS |
| Language | TypeScript |
| Deployment | Vercel |

---

## Getting Started

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) project
- A [Mapbox](https://mapbox.com) account
- A [Stripe](https://stripe.com) account (for Pro subscriptions)

### Setup

```bash
git clone https://github.com/TylerVanSickle/fishingapp.git
cd fishingapp
npm install
```

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_MONTHLY_PRICE_ID=price_...
STRIPE_ANNUAL_PRICE_ID=price_...
```

Run the database migrations in order from `/supabase/` using the Supabase SQL editor, then:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
src/
├── app/                  # Next.js App Router pages
│   ├── api/stripe/       # Stripe checkout, portal, webhook
│   ├── feed/             # Community catch feed
│   ├── map/              # Interactive spot map
│   ├── spots/            # Spot directory + detail pages
│   ├── catches/          # Catch detail + edit
│   ├── pro/              # Pro landing + Where to Fish
│   ├── profile/          # User profile + logbook + records
│   ├── journal/          # Fishing journal (Pro)
│   ├── gear/             # Gear tracker (Pro)
│   ├── trips/            # Trip planner (Pro)
│   └── ...
├── components/           # Reusable UI components
├── lib/
│   ├── actions/          # Server actions (social, onboarding, profile)
│   ├── supabase/         # Supabase client (server + client)
│   ├── stripe.ts         # Stripe config + plan definitions
│   ├── fishingScore.ts   # Solunar scoring algorithm
│   └── native.ts         # Capacitor native bridge
supabase/                 # SQL migrations (v1–v13)
```

---

## Mobile (Capacitor)

HookLine is configured for native iOS and Android via Capacitor, pointing at the deployed web app.

```bash
npm run build
npx cap sync
npx cap open ios      # Opens in Xcode
npx cap open android  # Opens in Android Studio
```

Native features: Camera, Geolocation, Haptics, Push Notifications.

---

## Roadmap

- [ ] App Store & Google Play submission
- [ ] Push notification delivery (FCM + APNs)
- [ ] Referral / invite system
- [ ] Offline mode with cached spot data
- [ ] Live conditions from weather API integration
- [ ] Tournament / group fishing events

---

## License

Private — all rights reserved. Not open for public contribution at this time.
