import { supabaseAdmin } from './_lib/supabaseServer.js';

/**
 * POST /api/submit-payment-utr
 *
 * Allows students who registered earlier without paying (or without UTR)
 * to submit their payment UTR against their existing registration.
 *
 * Rules:
 *  - Verifies registrationId and UTR number.
 *  - Strictly authorized via Supabase Auth JWT bearer token belonging to the student.
 *    Email addresses and UTRs alone NEVER serve as authorization.
 *  - Updates the SAME existing registration record:
 *      * utr_number = new UTR
 *      * payment_completed = true
 *      * status = 'Pending' (or Payment Verification Pending)
 *  - Does NOT create a duplicate registration record.
 *  - Does NOT send another thank-you / registration acknowledgement email.
 *  - The offer letter email is NOT sent here — it remains strictly tied to admin approval.
 *
 * Returns:
 *  200 { success: true, message: "Payment UTR submitted. Payment verification is now pending." }
 *  400 { error } — missing / invalid input
 *  401 { error } — unauthorized
 *  404 { error } — registration not found
 *  500 { error } — server error
 */
export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { registrationId, utrNumber } = req.body || {};

  if (!registrationId || typeof registrationId !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid registrationId' });
  }

  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!UUID_RE.test(registrationId)) {
    return res.status(400).json({ error: 'registrationId must be a valid UUID' });
  }

  if (!utrNumber || typeof utrNumber !== 'string' || !utrNumber.trim()) {
    return res.status(400).json({ error: 'Please provide a valid transaction reference / UTR number.' });
  }

  // Verify server configuration
  if (!process.env.SUPABASE_URL && !process.env.VITE_SUPABASE_URL) {
    return res.status(500).json({ error: 'Server configuration error: SUPABASE_URL is missing' });
  }
  if (!process.env.SUPABASE_SECRET_KEY && !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: 'Server configuration error: SUPABASE_SECRET_KEY is missing' });
  }

  try {
    // 1. Fetch existing registration
    const { data: reg, error: fetchErr } = await supabaseAdmin
      .from('registrations')
      .select('id, email, full_name, status, utr_number, payment_completed')
      .eq('id', registrationId)
      .maybeSingle();

    if (fetchErr) {
      console.error('[submit-payment-utr] DB fetch error:', fetchErr);
      return res.status(500).json({ error: 'Database error while retrieving registration' });
    }

    if (!reg) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    // 2. Strict Session Authorization
    // Email addresses and UTRs must NEVER serve as authorization.
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: Authentication session required' });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user || !user.email) {
      return res.status(401).json({ error: 'Unauthorized: Invalid or expired authentication session' });
    }

    if (user.email.toLowerCase() !== reg.email.toLowerCase()) {
      return res.status(403).json({ error: 'Forbidden: You are not authorized to update this registration' });
    }

    // If registration is already approved, advise the student
    if (reg.status === 'Approved') {
      return res.status(200).json({
        success: true,
        alreadyApproved: true,
        message: 'This registration has already been verified and approved.'
      });
    }

    // 3. Update the SAME registration record (Payment verification pending)
    const cleanUtr = utrNumber.trim();
    const { data: updatedReg, error: updateErr } = await supabaseAdmin
      .from('registrations')
      .update({
        utr_number: cleanUtr,
        payment_completed: true,
        status: 'Pending' // Keeps in Pending for admin review
      })
      .eq('id', registrationId)
      .select()
      .single();

    if (updateErr) {
      console.error('[submit-payment-utr] Update error:', updateErr);
      return res.status(500).json({ error: 'Failed to update payment details' });
    }

    return res.status(200).json({
      success: true,
      message: 'Payment reference submitted successfully. Payment verification is now pending review.',
      registration: updatedReg
    });

  } catch (err) {
    console.error('[submit-payment-utr] Error:', err);
    return res.status(500).json({ error: err.message });
  }
}
