import { supabaseAdmin } from './_lib/supabaseServer.js';

/**
 * POST /api/register
 *
 * Trusted backend registration submission endpoint.
 * Performs database insert with administrative server credentials,
 * enqueues the Stage 1 REGISTRATION_ACK email in email_outbox,
 * and immediately triggers the outbox worker.
 */
export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    fullName,
    email,
    phone,
    college,
    department,
    yearOfStudy,
    domain,
    planName,
    planPrice,
    referralCode,
    utrNumber,
    paymentCompleted,
    internshipDuration,
    startDate,
    endDate
  } = req.body || {};

  if (!fullName || !email || !domain) {
    return res.status(400).json({ error: 'Missing required registration fields' });
  }

  try {
    // 1. Insert into registrations table via trusted backend
    const insertPayload = {
      full_name: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: (phone || '').trim(),
      college: (college || '').trim(),
      department: (department || '').trim(),
      year_of_study: (yearOfStudy || '').trim(),
      domain: (domain || '').trim(),
      plan_name: (planName || 'Internship Program').trim(),
      plan_price: (planPrice || '399').toString(),
      referral_code: (referralCode || '').trim() || null,
      utr_number: (utrNumber || '').trim() || null,
      payment_completed: !!paymentCompleted,
      status: 'Pending',
      internship_duration: internshipDuration || '30 Days',
      start_date: startDate || null,
      end_date: endDate || null
    };

    const { data: reg, error: regError } = await supabaseAdmin
      .from('registrations')
      .insert([insertPayload])
      .select()
      .single();

    if (regError) {
      console.error('[register] DB insert error:', regError);
      return res.status(500).json({ error: 'Failed to save registration: ' + regError.message });
    }

    // 2. Enqueue REGISTRATION_ACK in email_outbox (trusted server-side)
    const outboxPayload = {
      fullName: reg.full_name,
      email: reg.email,
      domain: reg.domain,
      planName: reg.plan_name,
      planPrice: reg.plan_price,
      utrNumber: reg.utr_number
    };

    await supabaseAdmin
      .from('email_outbox')
      .upsert(
        {
          registration_id: reg.id,
          event_type: 'REGISTRATION_ACK',
          payload: outboxPayload,
          status: 'pending'
        },
        {
          onConflict: 'registration_id,event_type',
          ignoreDuplicates: true
        }
      );

    // 3. Trigger email worker immediately
    const origin = req.headers['x-forwarded-host']
      ? `https://${req.headers['x-forwarded-host']}`
      : (process.env.VITE_APP_URL || 'https://www.dakhedusolutions.in');

    const internalKey = process.env.INTERNAL_WORKER_KEY || process.env.CRON_SECRET || process.env.SUPABASE_SECRET_KEY;
    if (internalKey) {
      await fetch(`${origin}/api/process-email-outbox`, {
        method: 'POST',
        headers: {
          'x-worker-key': internalKey,
          'Authorization': `Bearer ${internalKey}`
        }
      }).catch(() => {});
    }

    return res.status(200).json({
      success: true,
      registrationId: reg.id,
      emailQueued: true
    });
  } catch (err) {
    console.error('[register] Unexpected error:', err);
    return res.status(500).json({ error: err.message });
  }
}
