# Find My Run 🏃‍♂️

> The easiest way to find a local run club in the UK

**Live at:** [findmyrun.club](https://findmyrun.club)

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

## Deploy to Vercel (5 minutes)

### Step 1: Push to GitHub

```bash
# Initialize git
git init
git add .
git commit -m "Initial commit"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/findmyrun.git
git push -u origin main
```

### Step 2: Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "New Project"
3. Import your `findmyrun` repository
4. Click "Deploy" (no config needed!)

### Step 3: Connect Your Domain

1. In Vercel dashboard, go to your project → Settings → Domains
2. Add `findmyrun.club`
3. Update DNS at your registrar:
   - **Option A (Recommended):** Point nameservers to Vercel
   - **Option B:** Add A record pointing to `76.76.21.21`

## Set Up Supabase (Database)

### Step 1: Create Project

1. Go to [supabase.com](https://supabase.com) and create account
2. Create new project (free tier is fine)
3. Wait for project to initialize

### Step 2: Run Schema

1. Go to SQL Editor in Supabase dashboard
2. Copy contents of `supabase/schema.sql`
3. Run the query

### Step 3: Seed Data

```bash
# Add seed data via SQL Editor or use the API
# The seed-data.ts file contains 40+ real UK run clubs
```

### Step 4: Connect to App

1. In Supabase: Settings → API → Copy URL and anon key
2. In Vercel: Settings → Environment Variables → Add:
   - `NEXT_PUBLIC_SUPABASE_URL` = your URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your anon key
3. Redeploy

## Project Structure

```
findmyrun/
├── app/
│   ├── page.tsx          # Home page (discover + this week views)
│   ├── [city]/page.tsx   # City pages (/manchester, /london, etc.)
│   ├── api/clubs/        # API routes
│   ├── layout.tsx        # Root layout with metadata
│   └── globals.css       # Tailwind styles
├── lib/
│   ├── seed-data.ts      # 40+ real UK run clubs
│   └── supabase.ts       # Database client
├── supabase/
│   └── schema.sql        # Database schema
└── public/               # Static assets
```

## Features

- ✅ **Discover View** - Browse all clubs with filters
- ✅ **This Week View** - See runs happening today onwards
- ✅ **City Pages** - SEO-optimized pages for each city
- ✅ **Club Details** - Meeting point, time, vibe, Instagram
- ✅ **Filters** - By pace, beginner-friendly, dog-friendly
- ✅ **Add Club Form** - Let clubs submit themselves
- ✅ **40+ Real Clubs** - Pre-seeded with actual UK run clubs

## Seed Data

The app comes pre-loaded with 40+ real UK run clubs:

| City | Clubs |
|------|-------|
| Manchester | 7 |
| London | 9 |
| Birmingham | 5 |
| Leeds | 5 |
| Bristol | 5 |
| Edinburgh | 4 |
| Glasgow | 3 |
| Liverpool | 1 |
| Sheffield | 1 |
| Newcastle | 1 |

All clubs sourced from official websites, RunTogether, and club Instagram pages.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Database:** Supabase (Postgres)
- **Hosting:** Vercel
- **Icons:** Lucide React

## Environment Variables

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Roadmap

### Phase 1 (Now)
- [x] Core directory with filters
- [x] City pages for SEO
- [x] Club submission form
- [x] Seed data with real clubs

### Phase 2 (Next)
- [ ] Supabase integration live
- [ ] Email notifications for submissions
- [ ] "I'm coming" attendance tracking
- [ ] Map view with Mapbox

### Phase 3 (Later)
- [ ] User accounts (save favorites)
- [ ] Club owner dashboard
- [ ] Newsletter for new clubs
- [ ] Mobile app

## Contributing

Found a club that's missing? [Submit it here](https://findmyrun.club/submit) or open a PR!

## License

MIT
