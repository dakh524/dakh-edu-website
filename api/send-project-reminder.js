import { supabaseAdmin } from './_lib/supabaseServer.js';

/**
 * Trigger Project Submission Reminder Email (Stage 3)
 * Admin can trigger manually or automated cron can call this endpoint
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

    const { registrationId } = req.body;
    if (!registrationId) {
      return res.status(400).json({ error: 'Missing registrationId' });
    }

    const { data: reg, error: regError } = await supabaseAdmin
      .from('registrations')
      .select('*')
      .eq('id', registrationId)
      .single();

    if (regError || !reg) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    const payload = {
      fullName: reg.full_name,
      email: reg.email,
      internNumber: reg.intern_number || `DES/INT/2026/001`,
      domain: reg.domain,
      endDate: reg.end_date || 'your scheduled end date'
    };

    // Insert or update in email_outbox with event_type 'PROJECT_REMINDER'
    const { data: job, error: outboxErr } = await supabaseAdmin
      .from('email_outbox')
      .upsert({
        registration_id: reg.id,
        event_type: 'PROJECT_REMINDER',
        status: 'pending',
        attempts: 0,
        payload
      }, { onConflict: 'registration_id,event_type' })
      .select()
      .single();

    if (outboxErr) {
      console.error('Error enqueuing project reminder:', outboxErr);
      return res.status(500).json({ error: outboxErr.message });
    }

    // Trigger outbox processor asynchronously
    fetch(`${process.env.VITE_APP_URL || 'https://dakhedusolutions.in'}/api/process-email-outbox`, {
      method: 'POST',
      headers: {
        'x-worker-key': process.env.INTERNAL_WORKER_KEY || process.env.CRON_SECRET || ''
      }
    }).catch(e => console.warn('Outbox trigger error:', e.message));

    return res.status(200).json({ success: true, message: 'Project reminder email queued successfully.' });
  } catch (err) {
    console.error('Error sending project reminder:', err);
    return res.status(500).json({ error: err.message });
  }
}
