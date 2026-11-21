-- ==============================================================================
-- DAKH EDU SOLUTIONS - EARNINGS & REVENUE LEDGER TABLE MIGRATION
-- Execute this script in your Supabase Project's SQL Editor to enable persistent cloud earnings tracking.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  category TEXT NOT NULL DEFAULT 'Other Income',
  payment_method TEXT DEFAULT 'UPI (GPay / PhonePe / Paytm)',
  reference_id TEXT,
  received_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for quick date-based and category lookups
CREATE INDEX IF NOT EXISTS idx_earnings_received_date ON public.earnings(received_date DESC);
CREATE INDEX IF NOT EXISTS idx_earnings_category ON public.earnings(category);

-- Enable Row Level Security (RLS)
ALTER TABLE public.earnings ENABLE ROW LEVEL SECURITY;

-- Allow public / anon read and write (matching your project's current admin setup)
DROP POLICY IF EXISTS "Allow all access to earnings" ON public.earnings;
CREATE POLICY "Allow all access to earnings"
  ON public.earnings
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);
