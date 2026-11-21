import { supabaseAdmin } from './_lib/supabaseServer.js';
import { processOutboxJobsInternal } from './_lib/outboxProcessor.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  // 1. Authorize Admin
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Unauthorized: missing authorization header' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(token);
    const allowedAdmins = [process.env.VITE_ADMIN_EMAIL, 'ceo@dakhedusolutions.in'];

    if (authErr || !user || !allowedAdmins.includes(user.email)) {
      return res.status(403).json({ success: false, error: 'Forbidden: admin access required' });
    }

    const { registrationId, logId, email, fullName, eventType, certificateLink, pdfBase64 } = req.body;

    let targetReg = null;
    let outboxJob = null;

    if (logId) {
      const { data: job } = await supabaseAdmin
        .from('email_outbox')
        .select('*')
        .eq('id', logId)
        .maybeSingle();
      if (job) outboxJob = job;
    }

    if (registrationId) {
      const { data: r } = await supabaseAdmin
        .from('registrations')
        .select('*')
        .eq('id', registrationId)
        .maybeSingle();
      if (r) targetReg = r;
    } else if (outboxJob) {
      if (outboxJob.registration_id) {
        const { data: r } = await supabaseAdmin
          .from('registrations')
          .select('*')
          .eq('id', outboxJob.registration_id)
          .maybeSingle();
        if (r) targetReg = r;
      }
      if (!targetReg && outboxJob.payload?.email) {
        const { data: r } = await supabaseAdmin
          .from('registrations')
          .select('*')
          .eq('email', outboxJob.payload.email.trim().toLowerCase())
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (r) targetReg = r;
      }
    }

    // 2. Prepare payload
    const finalEmail = targetReg?.email || outboxJob?.payload?.email || email;
    const finalName = targetReg?.full_name || outboxJob?.payload?.fullName || fullName || 'Student';
    const finalRegId = targetReg?.id || outboxJob?.registration_id || registrationId;

    if (!finalEmail) {
      return res.status(400).json({ success: false, error: 'Recipient email could not be resolved' });
    }

    const duration = targetReg?.internship_duration || (targetReg?.start_date && targetReg?.end_date ? `${targetReg.start_date} to ${targetReg.end_date}` : '30 Days');

    const payload = {
      fullName: finalName,
      email: finalEmail,
      domain: targetReg?.domain || outboxJob?.payload?.domain || 'Internship Domain',
      planName: targetReg?.plan_name || outboxJob?.payload?.planName || 'Internship Program',
      planPrice: targetReg?.plan_price || outboxJob?.payload?.planPrice || 'Free',
      utrNumber: targetReg?.utr_number || outboxJob?.payload?.utrNumber || 'PENDING',
      internNumber: targetReg?.intern_number || outboxJob?.payload?.internNumber || 'DES/INT/2026/001',
      college: targetReg?.college || outboxJob?.payload?.college || '',
      department: targetReg?.department || outboxJob?.payload?.department || '',
      mode: targetReg?.mode || outboxJob?.payload?.mode || 'Online',
      internshipDuration: duration,
      startDate: targetReg?.start_date || outboxJob?.payload?.startDate || '',
      endDate: targetReg?.end_date || outboxJob?.payload?.endDate || '',
      dateOfApplication: targetReg?.created_at || outboxJob?.payload?.dateOfApplication || new Date().toISOString(),
      certificateLink: certificateLink || outboxJob?.payload?.certificateLink || '',
      pdfBase64: pdfBase64 || outboxJob?.payload?.pdfBase64 || null
    };

    const targetEventType = eventType || 'REGISTRATION_ACK';

    // 3. Clear existing job if we have registrationId or logId
    if (finalRegId) {
      await supabaseAdmin
        .from('email_outbox')
        .delete()
        .eq('registration_id', finalRegId)
        .eq('event_type', targetEventType);
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
        event_type: targetEventType,
        payload,
        status: 'pending'
      })
      .select('id')
      .single();

    if (insertErr) {
      return res.status(500).json({ success: false, error: insertErr.message });
    }

    // 5. Directly process outbox job in-process (synchronously dispatches email via Resend)
    const dispatchResults = await processOutboxJobsInternal(5);

    return res.status(200).json({
      success: true,
      jobId: newJob?.id,
      dispatchResults
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
