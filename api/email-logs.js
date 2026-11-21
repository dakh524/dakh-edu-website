import { supabaseAdmin } from './_lib/supabaseServer.js';

export default async function handler(req, res) {
  // Authorize Admin
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

    // Fetch Outbox jobs with related registration details
    const { data: logs, error: logsErr } = await supabaseAdmin
      .from('email_outbox')
      .select('id, registration_id, event_type, status, attempts, last_error, provider_id, created_at, processed_at, payload')
      .order('created_at', { ascending: false })
      .limit(100);

    if (logsErr) {
      return res.status(500).json({ success: false, error: logsErr.message });
    }

    return res.status(200).json({
      success: true,
      logs: logs || []
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
