-- Migration: Club ownership claims system
-- Allows club organisers to claim and manage their listings

-- ============================================
-- CLUB CLAIMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.club_claims (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  club_id uuid NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  claimant_email text NOT NULL,
  claimant_name text,
  verification_method text NOT NULL CHECK (verification_method IN ('email', 'instagram')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  instagram_code text,  -- 6-char code for Instagram verification
  token_expires_at timestamp with time zone,
  verified_at timestamp with time zone,
  rejected_reason text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_club_claims_club_id ON public.club_claims(club_id);
CREATE INDEX IF NOT EXISTS idx_club_claims_status ON public.club_claims(status);
CREATE INDEX IF NOT EXISTS idx_club_claims_claimant_email ON public.club_claims(claimant_email);

-- Enable RLS
ALTER TABLE public.club_claims ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can create a claim
CREATE POLICY "Anyone can submit a claim" ON public.club_claims
  FOR INSERT WITH CHECK (true);

-- Policy: Claimants can view their own claims
CREATE POLICY "Claimants can view own claims" ON public.club_claims
  FOR SELECT USING (true);

-- ============================================
-- ADD OWNER COLUMNS TO CLUBS TABLE
-- ============================================
ALTER TABLE public.clubs
ADD COLUMN IF NOT EXISTS owner_email text;

ALTER TABLE public.clubs
ADD COLUMN IF NOT EXISTS owner_name text;

ALTER TABLE public.clubs
ADD COLUMN IF NOT EXISTS claimed_at timestamp with time zone;

-- Index for owner queries
CREATE INDEX IF NOT EXISTS idx_clubs_owner_email ON public.clubs(owner_email);

-- ============================================
-- OWNER SESSIONS TABLE (for magic link auth)
-- ============================================
CREATE TABLE IF NOT EXISTS public.owner_sessions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_email text NOT NULL,
  token_hash text NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_owner_sessions_email ON public.owner_sessions(owner_email);
CREATE INDEX IF NOT EXISTS idx_owner_sessions_expires ON public.owner_sessions(expires_at);

ALTER TABLE public.owner_sessions ENABLE ROW LEVEL SECURITY;

-- Trigger for updated_at on club_claims
CREATE TRIGGER club_claims_updated_at
  BEFORE UPDATE ON public.club_claims
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();
