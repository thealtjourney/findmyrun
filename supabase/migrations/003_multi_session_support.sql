-- Migration: Add multi-session support for clubs
-- Clubs can now have multiple run sessions (e.g., Tuesday track + Saturday long run)

-- Sessions table - stores individual run sessions for clubs
CREATE TABLE IF NOT EXISTS public.sessions (
  id uuid primary key default uuid_generate_v4(),
  club_name text not null,  -- Links to club (works with seed data)
  day text not null,        -- Monday, Tuesday, etc.
  time text not null,       -- e.g., "18:30", "09:00"
  distance text,            -- e.g., "5-10km", "10km+"
  meeting_point text,       -- Optional: different meeting point for this session
  session_type text,        -- Optional: "track", "long run", "social", "intervals", "tempo"
  description text,         -- Optional: session-specific description
  created_at timestamp with time zone default now()
);

-- Indexes for efficient queries
CREATE INDEX idx_sessions_club_name ON public.sessions(club_name);
CREATE INDEX idx_sessions_day ON public.sessions(day);

-- Enable RLS
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- Anyone can view sessions
CREATE POLICY "Anyone can view sessions" ON public.sessions
  FOR SELECT USING (true);

-- Anyone can insert sessions (for submissions)
CREATE POLICY "Anyone can add sessions" ON public.sessions
  FOR INSERT WITH CHECK (true);

-- Update submissions table to support multiple sessions
-- Add a sessions JSON field to store session data before approval
ALTER TABLE public.submissions
ADD COLUMN IF NOT EXISTS sessions jsonb DEFAULT '[]'::jsonb;

-- Note: The 'day' and 'time' columns on submissions remain for backward compatibility
-- and represent the primary/first session
