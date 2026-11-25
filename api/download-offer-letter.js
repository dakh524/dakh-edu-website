import { generateOfferLetterPdf } from './_lib/pdfGenerator.js';
import { supabaseAdmin } from './_lib/supabaseServer.js';

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
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

    const regId = req.query.id || req.body?.id;
    if (!regId) {
      return res.status(400).json({ error: 'Missing registration id parameter' });
    }

    const { data: reg, error: regError } = await supabaseAdmin
      .from('registrations')
      .select('*')
      .eq('id', regId)
      .single();

    if (regError || !reg) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    // Prepare duration
    const duration = reg.internship_duration || (reg.start_date && reg.end_date ? `${reg.start_date} to ${reg.end_date}` : '30 Days');

    const pdfBuffer = await generateOfferLetterPdf({
      fullName: reg.full_name,
      internNumber: reg.intern_number || `DES/INT/2026/${Math.floor(1000 + Math.random() * 9000)}`,
      college: reg.college,
      department: reg.department,
      domain: reg.domain,
      mode: reg.mode || 'Online',
      internshipDuration: duration,
      startDate: reg.start_date || null,
      endDate: reg.end_date || null,
      dateOfApplication: reg.created_at || new Date(),
      issueDate: new Date()
    });

    const safeName = (reg.full_name || 'Intern').replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `DAKH_Offer_Letter_${safeName}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(pdfBuffer);
  } catch (err) {
    console.error('Error generating offer letter download:', err);
    return res.status(500).json({ error: err.message || 'Failed to generate offer letter' });
  }
}
