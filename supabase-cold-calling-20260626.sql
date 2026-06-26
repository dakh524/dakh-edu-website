-- Run this SQL in your Supabase SQL Editor to create/update the cold_leads table

CREATE TABLE IF NOT EXISTS public.cold_leads (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name text NOT NULL,        -- Business Name
  phone_number text NOT NULL,       -- Phone
  business_type text,               -- Category
  location text,                    -- Address
  rating text,                      -- Rating
  reviews text,                     -- Reviews count
  website text,                     -- Website (No website / Link)
  priority text,                    -- Priority (High, Medium, Low)
  call_or_not text,                 -- Call or Not
  website_type_needed text,         -- Website Type Needed
  suggested_price text,             -- Suggested Price Range
  assigned_to text NOT NULL,        -- Team member assigned to call this lead
  status text DEFAULT 'Pending',    -- 'Pending', 'Approached'
  remarks text,                     -- notes of what happened
  approached_by text,               -- who made the call
  approached_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for cold_leads
ALTER TABLE public.cold_leads ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to prevent duplicates)
DROP POLICY IF EXISTS "Allow public read access to cold_leads" ON public.cold_leads;
DROP POLICY IF EXISTS "Allow authenticated read/write access to cold_leads" ON public.cold_leads;

-- Create policies
CREATE POLICY "Allow public read access to cold_leads" ON public.cold_leads 
  FOR SELECT USING (true);
CREATE POLICY "Allow authenticated read/write access to cold_leads" ON public.cold_leads 
  FOR ALL USING (auth.role() = 'authenticated');
