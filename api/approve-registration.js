import { supabaseAdmin } from './_lib/supabaseServer.js';

// ---------------------------------------------------------------------------
// Inline date helpers (pure Node.js, no external imports needed in Vercel env)
// Supports both ISO "YYYY-MM-DD" and legacy "DD MMM YYYY" date strings.
// ---------------------------------------------------------------------------
const MONTH_NAMES_API = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function apiParseDate(str) {
  if (!str || typeof str !== 'string') {
    throw new Error(`Invalid date value: ${JSON.stringify(str)}`);
  }
  const s = str.trim();
  // ISO
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (iso) {
    const [, y, m, d] = iso.map(Number);
    return new Date(Date.UTC(y, m - 1, d));
  }
  // Legacy: "27 Nov 2026"
  const legacy = /^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})$/.exec(s);
  if (legacy) {
    const [, dayStr, monStr, yearStr] = legacy;
    const monthIdx = MONTH_NAMES_API.findIndex(mn => mn.toLowerCase() === monStr.toLowerCase());
    if (monthIdx === -1) throw new Error(`Unrecognised month "${monStr}" in date "${str}"`);
    return new Date(Date.UTC(Number(yearStr), monthIdx, Number(dayStr)));
  }
  throw new Error(`Unrecognised date format "${str}" (expected YYYY-MM-DD or DD MMM YYYY)`);
}

function apiParseDuration(dur) {
  const m = /^\s*(\d+)\s*days?\s*$/i.exec((dur || '').trim());
  if (!m) throw new Error(`Unrecognised duration "${dur}" (expected e.g. "30 Days")`);
  const n = Number(m[1]);
  if (n <= 0) throw new Error(`Duration must be positive, got ${n}`);
  return n;
}

function apiFormatYMD(date) {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function apiComputeInclusiveEnd(startStr, durationStr) {
  const startDate = apiParseDate(startStr);
  const days = apiParseDuration(durationStr);
  const endDate = new Date(startDate);
  endDate.setUTCDate(endDate.getUTCDate() + days - 1);
  return apiFormatYMD(endDate);
}

/**
 * Approve Registration & Payment (Admin only)
 * 1. Strict Server-side JWT authentication
 * 2. Explicit Admin or SuperAdmin role check (HTTP 403 on failure)
 * 3. Validates and confirms final internship schedule (duration, start & end date)
 * 4. Idempotent payment approval & outbox enqueue
 * 5. Asynchronous trigger to process outbox using server-side trusted secret
 */
export default async function handler(req, res) {
  // Always return application/json
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check server configuration
  if (!process.env.SUPABASE_URL && !process.env.VITE_SUPABASE_URL) {
    return res.status(500).json({ 
      error: 'Server configuration error: SUPABASE_URL is missing in environment variables.' 
    });
  }

  if (!process.env.SUPABASE_SECRET_KEY && !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ 
      error: 'Server configuration error: SUPABASE_SECRET_KEY is missing in environment variables.' 
    });
  }

  // 1. Authorize admin strictly using Supabase Auth JWT
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const token = authHeader.split(' ')[1];
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

  if (authError || !user) {
    return res.status(401).json({ error: 'Unauthorized: Invalid authentication session' });
  }

  // 2. Explicit admin permission check (role or verified admin email)
  const isSuperAdmin = ['ceo@dakhedusolutions.in', 'admin@dakhedusolutions.in'].includes(user.email);
  let isTeamAdmin = false;

  if (!isSuperAdmin) {
    const { data: teamMember } = await supabaseAdmin
      .from('team_members')
      .select('role')
      .eq('email', user.email)
      .maybeSingle();

    if (teamMember && (teamMember.role === 'Admin' || teamMember.role === 'SuperAdmin')) {
      isTeamAdmin = true;
    }
  }

  if (!isSuperAdmin && !isTeamAdmin) {
    return res.status(403).json({ error: 'Forbidden: Insufficient administrator permissions' });
  }

  const { 
    registrationId, 
    manualInternNumber,
    confirmedDuration,
    confirmedStartDate,
    confirmedEndDate 
  } = req.body || {};

  if (!registrationId) {
    return res.status(400).json({ error: 'Missing registrationId parameter' });
  }

  try {
    // 3a. Server-side schedule validation — always recompute inclusive end date
    //     Supports both ISO "YYYY-MM-DD" and legacy "DD MMM YYYY" start dates.
    let computedEndDate = confirmedEndDate || null;
    if (confirmedStartDate && confirmedDuration) {
      let serverComputedEnd;
      try {
        serverComputedEnd = apiComputeInclusiveEnd(confirmedStartDate, confirmedDuration);
      } catch (scheduleErr) {
        return res.status(400).json({
          error: `Invalid schedule data: ${scheduleErr.message}`,
          code: 'INVALID_SCHEDULE'
        });
      }

      // If client sent an end date that conflicts with computed, reject with detail
      if (confirmedEndDate && confirmedEndDate !== serverComputedEnd) {
        return res.status(400).json({
          error: `Schedule mismatch: client sent end date ${confirmedEndDate} but calculated inclusive end for "${confirmedDuration}" starting ${confirmedStartDate} is ${serverComputedEnd}.`,
          code: 'SCHEDULE_MISMATCH',
          calculatedEndDate: serverComputedEnd,
          clientEndDate: confirmedEndDate
        });
      }
      // Always use the server-computed end date to guarantee correctness
      computedEndDate = serverComputedEnd;
    }

    // 3b. Atomically approve registration & enqueue Stage 2 job into outbox
    const { data, error } = await supabaseAdmin.rpc('approve_registration_and_enqueue_email', {
      p_reg_id: registrationId,
      p_admin_id: user.id,
      p_manual_intern_number: manualInternNumber || null,
      p_confirmed_duration: confirmedDuration || null,
      p_confirmed_start_date: confirmedStartDate || null,
      p_confirmed_end_date: computedEndDate || null
    });

    if (error) {
      console.error('Approval RPC error:', error);
      // Helpful guide if RPC hasn't been created yet in Supabase SQL editor
      if (error.code === 'PGRST202' || error.message?.includes('function') || error.message?.includes('does not exist')) {
        return res.status(500).json({
          error: "Database function 'approve_registration_and_enqueue_email' not found in Supabase. Please run the SQL migration in Supabase SQL editor.",
          details: error.message
        });
      }
      return res.status(400).json({ error: error.message });
    }

    // 4. Non-blocking trigger to process outbox immediately using server-side secret
    const cronSecret = process.env.CRON_SECRET;
    const internalKey = process.env.INTERNAL_WORKER_KEY || cronSecret;
    const origin = req.headers['origin'] || req.headers['x-forwarded-host'] 
      ? `https://${req.headers['x-forwarded-host'] || req.headers['host']}`
      : (process.env.VITE_APP_URL || 'https://dakhedusolutions.in');

    if (internalKey) {
      fetch(`${origin}/api/process-email-outbox`, {
        method: 'POST',
        headers: { 
          'x-worker-key': internalKey,
          'Authorization': `Bearer ${internalKey}`
        }
      }).catch(err => {
        console.log('Immediate outbox trigger pinged.');
      });
    }

    return res.status(200).json({
      success: true,
      message: data.already_approved 
        ? 'Registration is already approved.' 
        : 'Registration approved and offer letter email queued successfully.',
      registration: data
    });
  } catch (err) {
    console.error('Approve registration error:', err);
    return res.status(500).json({ error: err.message });
  }
}
