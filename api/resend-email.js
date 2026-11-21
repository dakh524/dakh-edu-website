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

    const { registrationId, logId, eventType, email, fullName } = req.body || {};

    let targetReg = null;

    // A. If registrationId provided, look up by ID
    if (registrationId) {
      const { data: regById } = await supabaseAdmin
        .from('registrations')
        .select('*')
        .eq('id', registrationId)
        .maybeSingle();
      if (regById) targetReg = regById;
    }

    // B. If not found or if email provided, look up by email
    if (!targetReg && email) {
      const { data: regByEmail } = await supabaseAdmin
        .from('registrations')
        .select('*')
        .eq('email', email.trim().toLowerCase())
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (regByEmail) targetReg = regByEmail;
    }

    // C. If still not found but we have logId, check outbox payload
    let outboxJob = null;
    if (logId) {
      const { data: job } = await supabaseAdmin
        .from('email_outbox')
        .select('*')
        .eq('id', logId)
        .maybeSingle();
      if (job) {
        outboxJob = job;
        if (!targetReg && job.registration_id) {
          const { data: r } = await supabaseAdmin
            .from('registrations')
            .select('*')
            .eq('id', job.registration_id)
            .maybeSingle();
          if (r) targetReg = r;
        }
        if (!targetReg && job.payload?.email) {
          const { data: r } = await supabaseAdmin
            .from('registrations')
            .select('*')
            .eq('email', job.payload.email.trim().toLowerCase())
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
          if (r) targetReg = r;
        }
      }
    }

    // 2. Prepare payload
    const finalEmail = targetReg?.email || outboxJob?.payload?.email || email;
    const finalName = targetReg?.full_name || outboxJob?.payload?.fullName || fullName || 'Student';
    const finalRegId = targetReg?.id || outboxJob?.registration_id || registrationId;

    if (!finalEmail) {
      return res.status(400).json({ success: false, error: 'Recipient email could not be resolved' });
    }

    const payload = {
      fullName: finalName,
      email: finalEmail,
      domain: targetReg?.domain || outboxJob?.payload?.domain || 'Internship Domain',
      planName: targetReg?.plan_name || outboxJob?.payload?.planName || 'Internship Program',
      planPrice: targetReg?.plan_price || outboxJob?.payload?.planPrice || 'Free',
      utrNumber: targetReg?.utr_number || outboxJob?.payload?.utrNumber || 'PENDING',
    };

    // 3. Clear existing job if we have registrationId or logId
    if (finalRegId) {
      await supabaseAdmin
        .from('email_outbox')
        .delete()
        .eq('registration_id', finalRegId)
        .eq('event_type', eventType || 'REGISTRATION_ACK');
    } else if (logId) {
      await supabaseAdmin
        .from('email_outbox')
        .delete()
        .eq('id', logId);
    }

    // 4. Insert fresh job
    const { data: newJob, error: insertErr } = await supabaseAdmin
      .from('email_outbox')
      .insert({
        registration_id: finalRegId || null,
        event_type: eventType || 'REGISTRATION_ACK',
        payload,
        status: 'pending'
      })
      .select('id')
      .single();

    if (insertErr) {
      return res.status(500).json({ success: false, error: insertErr.message });
    }

    // 5. Immediately trigger in-process dispatch
    await processOutboxJobsInternal(5);

    return res.status(200).json({
      success: true,
      jobId: newJob?.id
    });
    await processOutboxJobsInternal(5);

    return res.status(200).json({
      success: true,
      jobId: newJob?.id
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
