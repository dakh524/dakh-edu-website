-- =========================================================================
-- DAKH EDU SOLUTIONS - PRODUCTION APPROVAL RPC & SCHEDULING MIGRATION (V5)
-- (Ready for review - DO NOT EXECUTE until explicitly approved)
-- =========================================================================

-- 1. Ensure optional schedule flag exists on registrations table
ALTER TABLE public.registrations 
  ADD COLUMN IF NOT EXISTS is_custom_schedule boolean DEFAULT false;

-- 2. Concurrency-Safe Sequence for Official Intern ID (DAKH/INTERN/YYYY/NNNN)
CREATE SEQUENCE IF NOT EXISTS public.seq_dakh_intern_number START WITH 1001 INCREMENT BY 1;

-- 3. Ensure email_outbox table exists with unique deduplication constraint
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

-- 4. Primary 6-Parameter Atomic Approval RPC (Strict Types, Exact Day Validation)
-- Exact signature matching api/approve-registration.js:
-- (p_reg_id, p_admin_id, p_manual_intern_number, p_confirmed_duration, p_confirmed_start_date, p_confirmed_end_date)
-- Note: Does NOT use DEFAULT NULL on extra parameters, preventing any ambiguity with 3-arg callers.
CREATE OR REPLACE FUNCTION public.approve_registration_and_enqueue_email(
  p_reg_id uuid,
  p_admin_id uuid,
  p_manual_intern_number text,
  p_confirmed_duration text,
  p_confirmed_start_date text,
  p_confirmed_end_date text
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
  v_seq_val bigint;
  v_candidate_num text;
  v_year text := to_char(CURRENT_DATE, 'YYYY');
  v_parsed_start date;
  v_parsed_end date;
  v_inclusive_days integer;
  v_claimed_days integer;
  v_manual_trimmed text;
BEGIN
  -- 1. Select and lock registration row
  SELECT * INTO v_reg
  FROM public.registrations
  WHERE id = p_reg_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Registration not found with ID %', p_reg_id;
  END IF;

  -- 2. Idempotent short-circuit: If already approved, return immediately without duplicate side-effects
  IF v_reg.status = 'Approved' THEN
    RETURN jsonb_build_object(
      'id', p_reg_id,
      'status', 'Approved',
      'intern_number', v_reg.intern_number,
      'already_approved', true
    );
  END IF;

  -- 3. Strict Date & Schedule Validation
  v_duration := COALESCE(
    NULLIF(trim(p_confirmed_duration), ''), 
    v_reg.internship_duration, 
    '30 Days'
  );
  v_start_date := NULLIF(trim(COALESCE(p_confirmed_start_date, v_reg.start_date)), '');
  v_end_date := NULLIF(trim(COALESCE(p_confirmed_end_date, v_reg.end_date)), '');

  -- When start or end date is provided, both must be valid dates
  IF v_start_date IS NOT NULL OR v_end_date IS NOT NULL THEN
    IF v_start_date IS NULL OR v_end_date IS NULL THEN
      RAISE EXCEPTION 'Incomplete internship schedule: both start date and end date are required.';
    END IF;

    -- Strict date format parsing (YYYY-MM-DD)
    BEGIN
      v_parsed_start := v_start_date::date;
    EXCEPTION WHEN OTHERS THEN
      RAISE EXCEPTION 'Malformed start date: "%". Expected valid date format (YYYY-MM-DD).', v_start_date;
    END;

    BEGIN
      v_parsed_end := v_end_date::date;
    EXCEPTION WHEN OTHERS THEN
      RAISE EXCEPTION 'Malformed end date: "%". Expected valid date format (YYYY-MM-DD).', v_end_date;
    END;

    -- Date order validation
    IF v_parsed_end < v_parsed_start THEN
      RAISE EXCEPTION 'Invalid internship schedule: end date (%) cannot be earlier than start date (%).', v_end_date, v_start_date;
    END IF;

    -- Exact inclusive calendar day count: (End - Start) + 1
    v_inclusive_days := (v_parsed_end - v_parsed_start) + 1;

    -- Strict exact matching against claimed days in duration string (e.g. '15 Days', '30 Days', '45 Days', '32 Days')
    IF v_duration ~ '^[0-9]+\s*[Dd]ays?' THEN
      v_claimed_days := (regexp_match(v_duration, '^([0-9]+)'))[1]::integer;
      IF v_inclusive_days <> v_claimed_days THEN
        RAISE EXCEPTION 'Schedule mismatch: selected duration "%" (% days) does not match the inclusive date range (% to %: % days).',
          v_duration, v_claimed_days, v_start_date, v_end_date, v_inclusive_days;
      END IF;
    END IF;
  END IF;

  -- 4. Cross-Table Intern ID Uniqueness & Advisory Locking (Pair-Preserving)
  PERFORM pg_advisory_xact_lock(hashtext('dakh_intern_id_allocation'));

  v_manual_trimmed := NULLIF(trim(p_manual_intern_number), '');

  IF v_manual_trimmed IS NOT NULL THEN
    -- Check uniqueness across all other registrations and other students
    -- Permits the ID if it matches the current registration or its own linked student row
    IF EXISTS (
      SELECT 1 FROM public.registrations 
      WHERE intern_number = v_manual_trimmed AND id <> p_reg_id
      UNION
      SELECT 1 FROM public.students 
      WHERE intern_number = v_manual_trimmed AND (registration_id IS NULL OR registration_id <> p_reg_id)
    ) THEN
      RAISE EXCEPTION 'Duplicate Intern ID: "%" is already assigned to another student.', v_manual_trimmed;
    END IF;
    v_intern_number := v_manual_trimmed;

  ELSIF v_reg.intern_number IS NOT NULL AND trim(v_reg.intern_number) <> '' THEN
    -- Validate that existing pre-assigned intern number does not clash with any other registration or student
    -- Keeps the linked registration/student pair exception
    IF EXISTS (
      SELECT 1 FROM public.registrations 
      WHERE intern_number = trim(v_reg.intern_number) AND id <> p_reg_id
      UNION
      SELECT 1 FROM public.students 
      WHERE intern_number = trim(v_reg.intern_number) AND (registration_id IS NULL OR registration_id <> p_reg_id)
    ) THEN
      RAISE EXCEPTION 'Pre-assigned Intern ID collision: "%" is already assigned to another student.', trim(v_reg.intern_number);
    END IF;
    -- Preserve existing pre-assigned intern number safely
    v_intern_number := trim(v_reg.intern_number);

  ELSE
    -- Allocate collision-free intern number using the concurrency-safe atomic sequence
    LOOP
      v_seq_val := nextval('public.seq_dakh_intern_number');
      v_candidate_num := 'DAKH/INTERN/' || v_year || '/' || lpad(v_seq_val::text, 4, '0');
      
      IF NOT EXISTS (
        SELECT 1 FROM public.registrations WHERE intern_number = v_candidate_num
        UNION
        SELECT 1 FROM public.students WHERE intern_number = v_candidate_num
      ) THEN
        v_intern_number := v_candidate_num;
        EXIT;
      END IF;
    END LOOP;
  END IF;

  -- 5. Update Registration status to Approved and record confirmed schedule
  UPDATE public.registrations
  SET 
    status = 'Approved',
    intern_number = v_intern_number,
    internship_duration = v_duration,
    start_date = CASE 
      WHEN v_start_date IS NOT NULL THEN v_start_date 
      ELSE start_date 
    END,
    end_date = CASE 
      WHEN v_end_date IS NOT NULL THEN v_end_date 
      ELSE end_date 
    END,
    approved_at = now(),
    approved_by = p_admin_id,
    approval_email_status = 'pending'
  WHERE id = p_reg_id;

  -- 6. Synchronize students record if already linked (safely cast to date or text depending on column type)
  UPDATE public.students
  SET 
    intern_number = v_intern_number,
    status = 'Active',
    duration = v_duration,
    start_date = CASE 
      WHEN v_start_date IS NOT NULL THEN v_start_date::text::date 
      ELSE start_date 
    END,
    end_date = CASE 
      WHEN v_end_date IS NOT NULL THEN v_end_date::text::date 
      ELSE end_date 
    END
  WHERE registration_id = p_reg_id;

  -- 7. Enqueue PAYMENT_APPROVED in email_outbox with verified payload matching worker
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

-- 5. Exact Original 3-Parameter Signature with DEFAULT NULL::text
-- Order: (p_reg_id uuid, p_admin_id uuid, p_manual_intern_number text DEFAULT NULL::text)
-- Safely delegates to the primary 6-parameter RPC without modifying signature.
CREATE OR REPLACE FUNCTION public.approve_registration_and_enqueue_email(
  p_reg_id uuid,
  p_admin_id uuid,
  p_manual_intern_number text DEFAULT NULL::text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN public.approve_registration_and_enqueue_email(
    p_reg_id,
    p_admin_id,
    p_manual_intern_number,
    NULL,
    NULL,
    NULL
  );
END;
$$;

-- 6. Outbox Batch Claim RPC: Atomic Increment, Stale Recovery, and Exponential Backoff
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

-- 7. Permissions & Security Lockdown (Strict service_role execution only)
REVOKE ALL ON FUNCTION public.approve_registration_and_enqueue_email(uuid, uuid, text, text, text, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.approve_registration_and_enqueue_email(uuid, uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.claim_outbox_jobs(integer) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.approve_registration_and_enqueue_email(uuid, uuid, text, text, text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.approve_registration_and_enqueue_email(uuid, uuid, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.claim_outbox_jobs(integer) TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.seq_dakh_intern_number TO service_role;

ALTER TABLE public.email_outbox ENABLE ROW LEVEL SECURITY;
