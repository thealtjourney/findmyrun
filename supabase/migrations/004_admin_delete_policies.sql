-- Migration: Add delete policies for admin functionality
-- These policies allow deletion through the API (protected by admin secret in code)

-- Clubs table delete policy
CREATE POLICY "Allow deleting clubs" ON public.clubs
  FOR DELETE USING (true);

-- Submissions table delete policy
CREATE POLICY "Allow deleting submissions" ON public.submissions
  FOR DELETE USING (true);

-- Sessions table delete policy
CREATE POLICY "Allow deleting sessions" ON public.sessions
  FOR DELETE USING (true);

-- Attendance table delete policy (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'attendance' AND policyname = 'Allow deleting attendance'
  ) THEN
    CREATE POLICY "Allow deleting attendance" ON public.attendance
      FOR DELETE USING (true);
  END IF;
END $$;
