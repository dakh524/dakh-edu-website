-- Run this SQL in your Supabase SQL Editor to create the team_tasks table

CREATE TABLE IF NOT EXISTS public.team_tasks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  assigned_to text,           -- Name/Email of the assigned team member
  due_date date,
  priority text DEFAULT 'Medium', -- 'Low', 'Medium', 'High'
  status text DEFAULT 'To Do',    -- 'To Do', 'In Progress', 'Completed'
  created_by text,            -- Email of creator
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for team_tasks
ALTER TABLE public.team_tasks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to prevent duplicates)
DROP POLICY IF EXISTS "Allow public read access to team_tasks" ON public.team_tasks;
DROP POLICY IF EXISTS "Allow authenticated read/write access to team_tasks" ON public.team_tasks;

-- Create policies
CREATE POLICY "Allow public read access to team_tasks" ON public.team_tasks 
  FOR SELECT USING (true);
CREATE POLICY "Allow authenticated read/write access to team_tasks" ON public.team_tasks 
  FOR ALL USING (auth.role() = 'authenticated');
