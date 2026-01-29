-- Migration: Add terrain and female_only fields
-- Run this in the Supabase SQL Editor

-- Add terrain column to clubs table
ALTER TABLE public.clubs
ADD COLUMN IF NOT EXISTS terrain text check (terrain in ('road', 'trail', 'mixed'));

-- Add female_only column to clubs table
ALTER TABLE public.clubs
ADD COLUMN IF NOT EXISTS female_only boolean default false;

-- Add terrain column to submissions table
ALTER TABLE public.submissions
ADD COLUMN IF NOT EXISTS terrain text check (terrain in ('road', 'trail', 'mixed'));

-- Add female_only column to submissions table
ALTER TABLE public.submissions
ADD COLUMN IF NOT EXISTS female_only boolean default false;

-- Update the view to include new fields
CREATE OR REPLACE VIEW public.clubs_with_attendance AS
SELECT
  c.*,
  coalesce(a.coming_count, 0) as coming_this_week
FROM public.clubs c
LEFT JOIN (
  SELECT club_id, count(*) as coming_count
  FROM public.attendance
  WHERE session_date >= current_date
    AND session_date < current_date + interval '7 days'
  GROUP BY club_id
) a ON c.id = a.club_id
WHERE c.status = 'approved';
