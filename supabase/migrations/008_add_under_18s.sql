-- Add under_18s column to clubs and submissions
-- Requested by community feedback: whether club caters for under-18s

ALTER TABLE clubs ADD COLUMN IF NOT EXISTS under_18s BOOLEAN DEFAULT false;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS under_18s BOOLEAN DEFAULT false;
