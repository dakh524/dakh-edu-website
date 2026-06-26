-- Run this SQL code in your Supabase project's SQL Editor to set up the database tables

-- 1. Create certificates table
CREATE TABLE IF NOT EXISTS public.certificates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name text NOT NULL,
  email text NOT NULL,
  certificate_code text NOT NULL UNIQUE,
  domain text NOT NULL,
  certificate_link text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for certificates
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid duplication errors)
DROP POLICY IF EXISTS "Allow public read access to certificates" ON public.certificates;
DROP POLICY IF EXISTS "Allow authenticated read/write access to certificates" ON public.certificates;

-- Create policies
CREATE POLICY "Allow public read access to certificates" ON public.certificates 
  FOR SELECT USING (true);
CREATE POLICY "Allow authenticated read/write access to certificates" ON public.certificates 
  FOR ALL USING (auth.role() = 'authenticated');

-- 2. Create team_members table
CREATE TABLE IF NOT EXISTS public.team_members (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name text NOT NULL,
  email text NOT NULL UNIQUE,
  role text DEFAULT 'Member',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for team_members
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid duplication errors)
DROP POLICY IF EXISTS "Allow public read access to team_members" ON public.team_members;
DROP POLICY IF EXISTS "Allow authenticated read/write access to team_members" ON public.team_members;

-- Create policies
CREATE POLICY "Allow public read access to team_members" ON public.team_members 
  FOR SELECT USING (true);
CREATE POLICY "Allow authenticated read/write access to team_members" ON public.team_members 
  FOR ALL USING (auth.role() = 'authenticated');
