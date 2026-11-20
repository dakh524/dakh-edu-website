-- =========================================================================
-- DAKH EDU SOLUTIONS - PRODUCTION TWO-STAGE EMAIL & FLEXIBLE SCHEDULING MIGRATION
-- (Ready for review - DO NOT EXECUTE until explicitly approved)
-- =========================================================================

-- 1. Ensure all student, schedule, and batch columns exist on registrations table
ALTER TABLE public.registrations 
  ADD COLUMN IF NOT EXISTS internship_duration text DEFAULT '30 Days',
  ADD COLUMN IF NOT EXISTS start_date text,
  ADD COLUMN IF NOT EXISTS end_date text,
  ADD COLUMN IF NOT EXISTS is_custom_schedule boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'Pending',
  ADD COLUMN IF NOT EXISTS reg_email_status text DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS reg_email_sent_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS reg_email_attempts integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS reg_email_last_attempt_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS reg_email_provider_id text,
  ADD COLUMN IF NOT EXISTS reg_email_error text,
  ADD COLUMN IF NOT EXISTS approval_email_status text DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS approval_email_sent_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS approval_email_attempts integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS approval_email_last_attempt_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS approval_email_provider_id text,
  ADD COLUMN IF NOT EXISTS approval_email_error text,
  ADD COLUMN IF NOT EXISTS approved_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS approved_by uuid REFERENCES auth.users(id);

CREATE INDEX IF NOT EXISTS idx_registrations_status ON public.registrations (status);
CREATE INDEX IF NOT EXISTS idx_registrations_email_status ON public.registrations (reg_email_status, approval_email_status);

-- 2. Create the transactional email_outbox table with unique deduplication constraint
CREATE TABLE IF NOT EXISTS public.email_outbox (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  registration_id uuid REFERENCES public.registrations(id) ON DELETE CASCADE,
  event_type text NOT NULL, -- 'REGISTRATION_ACK' or 'PAYMENT_APPROVED'
  payload jsonb NOT NULL,
  status text NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'sent', 'failed'
  attempts integer NOT NULL DEFAULT 0,
  max_attempts integer NOT NULL DEFAULT 3,
  last_error text,
  provider_id text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  processed_at timestamp with time zone,
  last_attempt_at timestamp with time zone,
  CONSTRAINT uq_outbox_reg_event UNIQUE (registration_id, event_type)
);

CREATE INDEX IF NOT EXISTS idx_email_outbox_queue ON public.email_outbox (status, attempts, created_at);

-- 3. Automatic Trigger for Stage 1: Enqueues REGISTRATION_ACK in Outbox on Insert
CREATE OR REPLACE FUNCTION public.trg_enqueue_registration_ack_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.email_outbox (
    registration_id,
    event_type,
    payload,
    status
  ) VALUES (
    NEW.id,
    'REGISTRATION_ACK',
    jsonb_build_object(
      'fullName', NEW.full_name,
      'email', NEW.email,
      'domain', NEW.domain,
      'planName', NEW.plan_name,
      'planPrice', NEW.plan_price,
      'internshipDuration', NEW.internship_duration,
      'startDate', NEW.start_date,
      'endDate', NEW.end_date,
      'utrNumber', NEW.utr_number
    ),
    'pending'
  )
  ON CONFLICT (registration_id, event_type) DO NOTHING;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_registration_created_enqueue_email ON public.registrations;
CREATE TRIGGER on_registration_created_enqueue_email
  AFTER INSERT ON public.registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_enqueue_registration_ack_email();

-- 4. Idempotent Atomic Approval & Stage 2 Outbox Enqueue RPC (with Confirmed Student Schedule)
CREATE OR REPLACE FUNCTION public.approve_registration_and_enqueue_email(
  p_reg_id uuid,
  p_admin_id uuid,
  p_manual_intern_number text DEFAULT NULL,
  p_confirmed_duration text DEFAULT NULL,
  p_confirmed_start_date text DEFAULT NULL,
  p_confirmed_end_date text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_reg record;
  v_intern_number text;
  v_duration text;
  v_start_date text;
  v_end_date text;
BEGIN
  -- Select and lock registration
  SELECT * INTO v_reg
  FROM public.registrations
  WHERE id = p_reg_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Registration not found with ID %', p_reg_id;
  END IF;

  -- If already approved, return without duplicating work
  IF v_reg.status = 'Approved' THEN
    RETURN jsonb_build_object(
      'id', p_reg_id,
      'status', 'Approved',
      'intern_number', v_reg.intern_number,
      'already_approved', true
    );
  END IF;

  -- Determine Intern Number
  v_intern_number := COALESCE(
    p_manual_intern_number, 
    v_reg.intern_number, 
    'DAKH/INTERN/2026/' || lpad(floor(random() * 9000 + 1000)::text, 4, '0')
  );

  -- Determine Confirmed Schedule
  v_duration := COALESCE(p_confirmed_duration, v_reg.internship_duration, '30 Days');
  v_start_date := COALESCE(p_confirmed_start_date, v_reg.start_date);
  v_end_date := COALESCE(p_confirmed_end_date, v_reg.end_date);

  -- Update Registration status to Approved and record final confirmed schedule
  UPDATE public.registrations
  SET 
    status = 'Approved',
    intern_number = v_intern_number,
    internship_duration = v_duration,
    start_date = v_start_date,
    end_date = v_end_date,
    approved_at = now(),
    approved_by = p_admin_id,
    approval_email_status = 'pending'
  WHERE id = p_reg_id;

  -- Update students table record if exists
  UPDATE public.students
  SET 
    intern_number = v_intern_number,
    status = 'Active'
  WHERE registration_id = p_reg_id;

  -- Enqueue PAYMENT_APPROVED in email_outbox with confirmed student details
  INSERT INTO public.email_outbox (
    registration_id,
    event_type,
    payload,
    status
  ) VALUES (
    p_reg_id,
    'PAYMENT_APPROVED',
    jsonb_build_object(
      'fullName', v_reg.full_name,
      'email', v_reg.email,
      'phone', v_reg.phone,
      'college', v_reg.college,
      'department', v_reg.department,
      'year', v_reg.year_of_study,
      'domain', v_reg.domain,
      'planName', v_reg.plan_name,
      'internshipDuration', v_duration,
      'startDate', v_start_date,
      'endDate', v_end_date,
      'utrNumber', v_reg.utr_number,
      'dateOfApplication', v_reg.created_at,
      'internNumber', v_intern_number
    ),
    'pending'
  )
  ON CONFLICT (registration_id, event_type) DO NOTHING;

  RETURN jsonb_build_object(
    'id', p_reg_id,
    'status', 'Approved',
    'intern_number', v_intern_number,
    'already_approved', false
  );
END;
$$;

-- 5. Outbox Batch Claim RPC: Atomic Increment, Stale Recovery, and Exponential Backoff
CREATE OR REPLACE FUNCTION public.claim_outbox_jobs(batch_size integer DEFAULT 10)
RETURNS SETOF public.email_outbox
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  WITH available_jobs AS (
    SELECT id
    FROM public.email_outbox
    WHERE 
      (status = 'pending' AND attempts < max_attempts)
      OR (status = 'processing' AND last_attempt_at < (now() - interval '5 minutes') AND attempts < max_attempts)
      OR (
        status = 'failed' 
        AND attempts < max_attempts 
        AND last_attempt_at < (now() - (power(2, attempts) * interval '1 minute'))
      )
    ORDER BY created_at ASC
    LIMIT batch_size
    FOR UPDATE SKIP LOCKED
  )
  UPDATE public.email_outbox o
  SET 
    status = 'processing',
    attempts = o.attempts + 1,
    last_attempt_at = now()
  FROM available_jobs a
  WHERE o.id = a.id
  RETURNING o.*;
END;
$$;

-- 6. Permissions & Security Lockdown
REVOKE ALL ON FUNCTION public.trg_enqueue_registration_ack_email() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.approve_registration_and_enqueue_email(uuid, uuid, text, text, text, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.claim_outbox_jobs(integer) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.approve_registration_and_enqueue_email(uuid, uuid, text, text, text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.claim_outbox_jobs(integer) TO service_role;

ALTER TABLE public.email_outbox ENABLE ROW LEVEL SECURITY;
