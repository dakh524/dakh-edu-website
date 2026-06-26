-- Run this SQL script in your Supabase SQL Editor to add the custom fields and call targets:

-- 1. Add new columns to cold_leads table
ALTER TABLE public.cold_leads 
  ADD COLUMN IF NOT EXISTS key_hook_pain_point text,
  ADD COLUMN IF NOT EXISTS google_maps_link text;

-- 2. Add weekly_call_target to team_members table
ALTER TABLE public.team_members
  ADD COLUMN IF NOT EXISTS weekly_call_target integer DEFAULT 50;

-- 3. Notify PostgREST to reload schema cache (fixes schema cache errors)
NOTIFY pgrst, 'reload schema';
