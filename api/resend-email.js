import { supabaseAdmin } from './_lib/supabaseServer.js';
import { processOutboxJobsInternal } from './_lib/outboxProcessor.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(token);
    const allowedAdmins = [process.env.VITE_ADMIN_EMAIL, 'ceo@dakhedusolutions.in'];

    if (authErr || !user || !allowedAdmins.includes(user.email)) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    const { registrationId, eventType } = req.body || {};

    if (!registrationId) {
      // General retry of all pending/failed jobs
      const result = await processOutboxJobsInternal(10);
      return res.status(200).json({ success: true, result });
    }

    // Specific resend for a registration
    // 1. Fetch registration
    const { data: reg, error: regErr } = await supabaseAdmin
      .from('registrations')
      .select('*')
      .eq('id', registrationId)
      .single();

    if (regErr || !reg) {
      return res.status(404).json({ success: false, error: 'Registration not found' });
    }

    // 2. Clear or reset existing outbox job so it will re-dispatch
    await supabaseAdmin
      .from('email_outbox')
      .delete()
      .eq('registration_id', registrationId)
      .eq('event_type', eventType || 'REGISTRATION_ACK');

    // 3. Insert fresh job
    const payload = {
      fullName: reg.full_name,
      email: reg.email,
      domain: reg.domain,
      planName: reg.plan_name,
      planPrice: reg.plan_price,
      utrNumber: reg.utr_number,
    };

    const { data: newJob, error: insertErr } = await supabaseAdmin
      .from('email_outbox')
      .insert({
        registration_id: reg.id,
        event_type: eventType || 'REGISTRATION_ACK',
        payload,
        status: 'pending'
      })
      .select('id')
      .single();

    if (insertErr) {
      return res.status(500).json({ success: false, error: insertErr.message });
    }

    // 4. Immediately trigger dispatch
    await processOutboxJobsInternal(5);

    return res.status(200).json({
      success: true,
      jobId: newJob?.id
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
