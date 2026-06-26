-- Run this SQL in your Supabase SQL Editor to add working hours and activity tracking columns to team_members:

ALTER TABLE public.team_members
  ADD COLUMN IF NOT EXISTS today_work_seconds integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS weekly_work_seconds integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_active_at timestamp with time zone DEFAULT now();

-- Reload the schema cache to ensure the API recognizes the columns immediately
NOTIFY pgrst, 'reload schema';
