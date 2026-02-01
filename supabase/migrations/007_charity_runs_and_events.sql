-- Migration: Add Charity Runs and Events tables
-- Date: 2026-02-01

-- ============================================
-- CHARITY RUNS TABLE
-- For one-off charity running events with fundraising
-- ============================================
create table if not exists public.charity_runs (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  charity_name text not null,
  description text,
  city text not null,
  area text,

  -- Event details
  event_date date not null,
  start_time text not null,
  distance text,
  meeting_point text not null,

  -- Fundraising info
  fundraising_url text,  -- Link to JustGiving, GoFundMe, etc.
  fundraising_target decimal(10, 2),  -- Target amount in GBP
  fundraising_current decimal(10, 2) default 0,  -- Current amount raised

  -- Contact & registration
  registration_url text,
  contact_email text,
  organizer_name text,

  -- Social
  instagram text,
  website text,

  -- Moderation
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  verified boolean default false,

  -- Timestamps
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Indexes for charity runs
create index idx_charity_runs_city on public.charity_runs(city);
create index idx_charity_runs_date on public.charity_runs(event_date);
create index idx_charity_runs_status on public.charity_runs(status);

-- Enable RLS
alter table public.charity_runs enable row level security;

-- Policy: Anyone can view approved charity runs
create policy "Public can view approved charity runs" on public.charity_runs
  for select using (status = 'approved');

-- Policy: Anyone can submit a charity run
create policy "Anyone can submit a charity run" on public.charity_runs
  for insert with check (true);

-- Trigger for updated_at
create trigger charity_runs_updated_at
  before update on public.charity_runs
  for each row
  execute function public.update_updated_at();


-- ============================================
-- EVENTS TABLE
-- For one-off dated running events (races, special runs, etc.)
-- ============================================
create table if not exists public.events (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  city text not null,
  area text,

  -- Event details
  event_date date not null,
  start_time text not null,
  distance text,
  meeting_point text not null,

  -- Event type
  event_type text check (event_type in ('race', 'fun_run', 'special_session', 'parkrun', 'social', 'other')) default 'fun_run',

  -- Pricing
  is_free boolean default true,
  price decimal(10, 2),
  price_currency text default 'GBP',

  -- Registration
  registration_url text,
  registration_deadline date,
  max_participants integer,

  -- Contact
  contact_email text,
  organizer_name text,

  -- Linked club (optional)
  club_id uuid references public.clubs(id) on delete set null,

  -- Social
  instagram text,
  website text,

  -- Moderation
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  featured boolean default false,

  -- Timestamps
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Indexes for events
create index idx_events_city on public.events(city);
create index idx_events_date on public.events(event_date);
create index idx_events_status on public.events(status);
create index idx_events_type on public.events(event_type);

-- Enable RLS
alter table public.events enable row level security;

-- Policy: Anyone can view approved future events
create policy "Public can view approved events" on public.events
  for select using (status = 'approved');

-- Policy: Anyone can submit an event
create policy "Anyone can submit an event" on public.events
  for insert with check (true);

-- Trigger for updated_at
create trigger events_updated_at
  before update on public.events
  for each row
  execute function public.update_updated_at();


-- ============================================
-- VIEWS
-- ============================================

-- View for upcoming charity runs
create or replace view public.upcoming_charity_runs as
select *
from public.charity_runs
where status = 'approved'
  and event_date >= current_date
order by event_date asc;

-- View for upcoming events
create or replace view public.upcoming_events as
select
  e.*,
  c.name as club_name
from public.events e
left join public.clubs c on e.club_id = c.id
where e.status = 'approved'
  and e.event_date >= current_date
order by e.event_date asc;
