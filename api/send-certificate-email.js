import { supabaseAdmin } from './_lib/supabaseServer.js';

/**
 * Dispatch Internship Completion Certificate Email (Stage 4)
 * Triggered when Admin issues certificate or clicks "Send Certificate Email"
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized: invalid token' });
    }

    const { registrationId, certificateLink, pdfBase64, email, fullName, domain, internNumber } = req.body;
    
    let targetEmail = email;
    let targetName = fullName;
    let targetDomain = domain;
    let targetInternNum = internNumber;

    if (registrationId) {
      const { data: reg } = await supabaseAdmin
        .from('registrations')
        .select('*')
        .eq('id', registrationId)
        .single();

      if (reg) {
        targetEmail = targetEmail || reg.email;
        targetName = targetName || reg.full_name;
        targetDomain = targetDomain || reg.domain;
        targetInternNum = targetInternNum || reg.intern_number;
      }
    }

    if (!targetEmail) {
      return res.status(400).json({ error: 'Recipient email is required.' });
    }

    const payload = {
      fullName: targetName,
      email: targetEmail,
      internNumber: targetInternNum || `DES/INT/2026/001`,
      domain: targetDomain,
      certificateLink: certificateLink || '',
      pdfBase64: pdfBase64 || null
    };

    // Insert or update in email_outbox with event_type 'CERTIFICATE_DISPATCH'
    const { data: job, error: outboxErr } = await supabaseAdmin
      .from('email_outbox')
      .upsert({
        registration_id: registrationId || null,
        event_type: 'CERTIFICATE_DISPATCH',
        status: 'pending',
        attempts: 0,
        payload
      }, { onConflict: registrationId ? 'registration_id,event_type' : undefined })
      .select()
      .single();

    if (outboxErr) {
      console.error('Error enqueuing certificate email:', outboxErr);
      return res.status(500).json({ error: outboxErr.message });
    }

    // Trigger outbox processor asynchronously
    fetch(`${process.env.VITE_APP_URL || 'https://dakhedusolutions.in'}/api/process-email-outbox`, {
      method: 'POST',
      headers: {
        'x-worker-key': process.env.INTERNAL_WORKER_KEY || process.env.CRON_SECRET || ''
      }
    }).catch(e => console.warn('Outbox trigger error:', e.message));

    return res.status(200).json({ success: true, message: 'Certificate email queued successfully.' });
  } catch (err) {
    console.error('Error sending certificate email:', err);
    return res.status(500).json({ error: err.message });
  }
}
