# Club Owner Claim Flow - Implementation Plan

## Overview
Allow club organisers to claim ownership of their listing, verify via email or Instagram, and edit their club details through a simple dashboard.

## User Choices
- **Verification**: Both email and Instagram options
- **Edit approval**: Instant (no admin approval needed)
- **Owner login**: Magic link via email (no passwords)

---

## What We're Building

### 1. Claim Flow
- "Claim this club" button on club detail modal
- Claim form: enter your email, name, choose verification method
- Email verification: magic link sent to club's contact email
- Instagram verification: show a code, owner DMs it to @findmyrun, admin verifies manually

### 2. Owner Dashboard
- Magic link login (enter email → get link)
- Simple edit form for club details
- All edits go live immediately

### 3. Admin Tools
- View pending Instagram claims
- Verify/reject claims with one click

---

## Database Changes

### New table: `club_claims`
```sql
create table club_claims (
  id uuid primary key default gen_random_uuid(),
  club_id uuid references clubs(id) on delete cascade,
  claimant_email text not null,
  claimant_name text,
  verification_method text check (verification_method in ('email', 'instagram')),
  status text default 'pending' check (status in ('pending', 'verified', 'rejected')),
  instagram_code text,  -- 6-char code for Instagram verification
  token_expires_at timestamptz,
  verified_at timestamptz,
  rejected_reason text,
  created_at timestamptz default now()
);
```

### Modify `clubs` table
```sql
alter table clubs add column owner_email text;
alter table clubs add column owner_name text;
alter table clubs add column claimed_at timestamptz;
```

---

## New Files

### API Routes
| File | Purpose |
|------|---------|
| `app/api/claims/route.ts` | POST: initiate a claim |
| `app/api/claims/[id]/verify/route.ts` | GET: verify email token |
| `app/api/admin/claims/route.ts` | GET: list pending claims |
| `app/api/admin/claims/[id]/verify/route.ts` | POST: admin verifies Instagram claim |
| `app/api/admin/claims/[id]/reject/route.ts` | POST: admin rejects claim |
| `app/api/owner/login/route.ts` | POST: send magic link to owner |
| `app/api/owner/auth/route.ts` | GET: verify owner magic link |
| `app/api/owner/clubs/[id]/route.ts` | GET/PUT: fetch and update club |

### Pages
| File | Purpose |
|------|---------|
| `app/claim/[clubId]/page.tsx` | Claim initiation form |
| `app/claim/verify/page.tsx` | "Check your email" / Instagram code display |
| `app/claim/success/page.tsx` | Claim approved, link to dashboard |
| `app/owner/page.tsx` | Owner dashboard (list clubs, edit) |
| `app/owner/login/page.tsx` | Enter email to get magic link |

### Lib Updates
| File | Changes |
|------|---------|
| `lib/tokens.ts` | Add claim verification token types |
| `lib/email.ts` | Add claim emails (verify, approved, rejected, owner login) |

---

## User Flows

### Email Verification
```
1. User clicks "Claim this club" on club modal
2. → /claim/[clubId] - enters email, name, selects "Email"
3. Backend creates claim, sends magic link to club's contact_email
4. Club organiser clicks link in email
5. → /api/claims/[id]/verify validates token
6. Claim approved, club.owner_email set
7. → /claim/success with link to dashboard
```

### Instagram Verification
```
1. User clicks "Claim this club" on club modal
2. → /claim/[clubId] - enters email, name, selects "Instagram"
3. Backend creates claim with random 6-char code
4. → /claim/verify shows code: "DM 'ABC123' to @findmyrun"
5. Admin sees DM, goes to admin panel
6. Admin clicks "Verify" on matching claim
7. Claim approved, owner notified via email
8. → Owner can now login to dashboard
```

### Owner Login & Edit
```
1. Owner goes to /owner/login
2. Enters email, receives magic link
3. Clicks link → logged in with 7-day session cookie
4. Dashboard shows their clubs
5. Click "Edit" → form with all editable fields
6. Save → changes go live immediately
```

---

## Security

- **Tokens**: HMAC-SHA256, 7-day expiry (same pattern as admin)
- **Email verification**: Only works if claimant email matches club's contact_email (or admin override)
- **Instagram verification**: Requires manual admin action
- **Owner sessions**: HTTP-only cookie, 7-day expiry
- **One owner per club**: Cannot claim already-claimed clubs

---

## Implementation Order

### Phase 1: Database & Core
1. Create Supabase migration for `club_claims` table and `clubs` columns
2. Extend `lib/tokens.ts` with claim token types
3. Add email templates to `lib/email.ts`

### Phase 2: Claim Flow
4. Build `/api/claims` POST endpoint
5. Build `/api/claims/[id]/verify` GET endpoint
6. Build `/claim/[clubId]` page (claim form)
7. Build `/claim/verify` page (instructions)
8. Build `/claim/success` page
9. Add "Claim this club" button to ClubDetail modal

### Phase 3: Admin Tools
10. Build `/api/admin/claims` GET endpoint
11. Build `/api/admin/claims/[id]/verify` POST endpoint
12. Add claims section to admin page

### Phase 4: Owner Dashboard
13. Build `/api/owner/login` POST endpoint
14. Build `/api/owner/auth` GET endpoint
15. Build `/api/owner/clubs/[id]` GET/PUT endpoints
16. Build `/owner/login` page
17. Build `/owner` dashboard page with edit form

---

## Estimated Scope
- ~12 new files
- ~800-1000 lines of code
- Database migration
- 4 new email templates
