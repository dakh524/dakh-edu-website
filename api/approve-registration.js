import { supabaseAdmin } from './_lib/supabaseServer.js';

/**
 * Approve Registration & Payment (Admin only)
 * 1. Strict Server-side JWT authentication
 * 2. Explicit Admin or SuperAdmin role check (HTTP 403 on failure)
 * 3. Validates and confirms final internship schedule (duration, start & end date)
 * 4. Idempotent payment approval & outbox enqueue
 * 5. Asynchronous trigger to process outbox using server-side trusted secret
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
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
    // 3. Atomically approve registration & enqueue Stage 2 job into outbox
    const { data, error } = await supabaseAdmin.rpc('approve_registration_and_enqueue_email', {
      p_reg_id: registrationId,
      p_admin_id: user.id,
      p_manual_intern_number: manualInternNumber || null,
      p_confirmed_duration: confirmedDuration || null,
      p_confirmed_start_date: confirmedStartDate || null,
      p_confirmed_end_date: confirmedEndDate || null
    });

    if (error) {
      console.error('Approval RPC error:', error);
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
