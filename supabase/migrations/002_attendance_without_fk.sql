-- Migration: Update attendance table to work without foreign key
-- This allows tracking attendance for clubs that are in seed data (not yet in database)

-- Drop the existing attendance table and recreate without FK
DROP TABLE IF EXISTS public.attendance;

CREATE TABLE public.attendance (
  id uuid primary key default uuid_generate_v4(),
  club_name text not null,  -- Using club name as identifier (works with seed data)
  session_date date not null,
  visitor_id text,  -- Anonymous visitor tracking (optional, from localStorage)
  created_at timestamp with time zone default now()
);

-- Index for efficient queries
CREATE INDEX idx_attendance_club_name ON public.attendance(club_name);
CREATE INDEX idx_attendance_date ON public.attendance(session_date);
CREATE INDEX idx_attendance_visitor ON public.attendance(visitor_id);

-- Enable RLS
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (mark attendance)
CREATE POLICY "Anyone can mark attendance" ON public.attendance
  FOR INSERT WITH CHECK (true);

-- Anyone can read attendance counts
CREATE POLICY "Anyone can view attendance" ON public.attendance
  FOR SELECT USING (true);
