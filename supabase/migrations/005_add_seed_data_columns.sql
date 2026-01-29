-- Migration: Add columns for seed data fields
-- These fields are used in the seed data and need to be in the database

ALTER TABLE public.clubs
ADD COLUMN IF NOT EXISTS influencer_led boolean DEFAULT false;

ALTER TABLE public.clubs
ADD COLUMN IF NOT EXISTS pace_5k text;

ALTER TABLE public.clubs
ADD COLUMN IF NOT EXISTS pace_10k text;
