-- Find My Run - Supabase Database Schema
-- Run this in the Supabase SQL Editor to set up your database

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- CLUBS TABLE
-- ============================================
create table public.clubs (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  city text not null,
  area text,
  lat decimal(10, 8) not null,
  lng decimal(11, 8) not null,
  day text not null,
  time text not null,
  distance text,
  meeting_point text not null,
  description text,
  pace text check (pace in ('slow', 'mixed', 'fast')) default 'mixed',
  beginner_friendly boolean default false,
  dog_friendly boolean default false,
  post_run text,
  instagram text,
  strava_url text,
  website text,
  contact_email text,
  verified boolean default false,
  status text default 'approved' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Index for city queries (most common filter)
create index idx_clubs_city on public.clubs(city);
create index idx_clubs_status on public.clubs(status);
create index idx_clubs_day on public.clubs(day);

-- Enable Row Level Security
alter table public.clubs enable row level security;

-- Policy: Anyone can read approved clubs
create policy "Public can view approved clubs" on public.clubs
  for select using (status = 'approved');

-- ============================================
-- SUBMISSIONS TABLE (for new club submissions)
-- ============================================
create table public.submissions (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  city text not null,
  area text,
  day text not null,
  time text not null,
  distance text,
  meeting_point text not null,
  description text,
  pace text check (pace in ('slow', 'mixed', 'fast')) default 'mixed',
  beginner_friendly boolean default false,
  dog_friendly boolean default false,
  post_run text,
  instagram text,
  website text,
  submitter_email text not null,
  submitter_name text,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  admin_notes text,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.submissions enable row level security;

-- Policy: Anyone can insert submissions
create policy "Anyone can submit a club" on public.submissions
  for insert with check (true);

-- ============================================
-- COMING THIS WEEK (optional - track interest)
-- ============================================
create table public.attendance (
  id uuid primary key default uuid_generate_v4(),
  club_id uuid references public.clubs(id) on delete cascade,
  session_date date not null,
  email text,
  created_at timestamp with time zone default now()
);

create index idx_attendance_club on public.attendance(club_id);
create index idx_attendance_date on public.attendance(session_date);

alter table public.attendance enable row level security;

create policy "Anyone can mark attendance" on public.attendance
  for insert with check (true);

-- ============================================
-- NEWSLETTER SUBSCRIBERS (optional)
-- ============================================
create table public.subscribers (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  city text,
  created_at timestamp with time zone default now()
);

alter table public.subscribers enable row level security;

create policy "Anyone can subscribe" on public.subscribers
  for insert with check (true);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger for clubs table
create trigger clubs_updated_at
  before update on public.clubs
  for each row
  execute function public.update_updated_at();

-- ============================================
-- VIEWS
-- ============================================

-- View for clubs with session counts this week
create or replace view public.clubs_with_attendance as
select
  c.*,
  coalesce(a.coming_count, 0) as coming_this_week
from public.clubs c
left join (
  select club_id, count(*) as coming_count
  from public.attendance
  where session_date >= current_date
    and session_date < current_date + interval '7 days'
  group by club_id
) a on c.id = a.club_id
where c.status = 'approved';
