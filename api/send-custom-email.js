import { getServiceSupabase } from './_lib/supabaseServer.js';
import { sendEmailWithRetry, SENDER_EMAIL } from './_lib/resend.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  // Authorize Admin
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Authorization header missing' });
  }

  const token = authHeader.split(' ')[1];
  const supabase = getServiceSupabase();

  try {
    const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
    const allowedAdmins = [process.env.VITE_ADMIN_EMAIL, 'ceo@dakhedusolutions.in'];

    if (authErr || !user || !allowedAdmins.includes(user.email)) {
      return res.status(403).json({ success: false, error: 'Forbidden: Admin access required' });
    }

    const { recipients, subject, messageText, actionUrl, actionText } = req.body;

    if (!Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({ success: false, error: 'No recipients provided' });
    }
    if (!subject || !messageText) {
      return res.status(400).json({ success: false, error: 'Subject and message are required' });
    }

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; }
    .header { background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%); padding: 32px 24px; text-align: center; color: white; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
    .header p { margin: 6px 0 0 0; opacity: 0.9; font-size: 13px; letter-spacing: 0.5px; }
    .body { padding: 32px 24px; line-height: 1.6; font-size: 15px; }
    .content-box { background: #fdf4ff; border-left: 4px solid #a855f7; padding: 16px; border-radius: 8px; margin: 20px 0; font-size: 14px; white-space: pre-wrap; color: #334155; }
    .btn { display: inline-block; background: #7c3aed; color: #ffffff !important; padding: 12px 28px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 14px; margin-top: 16px; }
    .footer { padding: 20px 24px; background: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #64748b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>DAKH EDU SOLUTIONS</h1>
      <p>Official Announcement & Updates</p>
    </div>
    <div class="body">
      <div class="content-box">
${messageText.replace(/\n/g, '<br/>')}
      </div>
      ${actionUrl ? `<div style="text-align: center; margin-top: 24px;"><a href="${actionUrl}" class="btn" target="_blank">${actionText || 'View Details'}</a></div>` : ''}
    </div>
    <div class="footer">
      <p>This is an official communication from <strong>DAKH EDU SOLUTIONS</strong>.</p>
      <p>Tamil Nadu, India | support@dakhedusolutions.in</p>
    </div>
  </div>
</body>
</html>
    `;

    // Process delivery to recipients
    const results = [];
    for (const recipient of recipients) {
      try {
        const sendResult = await sendEmailWithRetry({
          to: recipient.email,
          subject,
          html: htmlContent
        });
        results.push({ email: recipient.email, success: true, id: sendResult.id });
      } catch (err) {
        results.push({ email: recipient.email, success: false, error: err.message });
      }
    }

    return res.status(200).json({
      success: true,
      total: recipients.length,
      sentCount: results.filter(r => r.success).length,
      failedCount: results.filter(r => !r.success).length,
      results
    });
  } catch (err) {
    console.error('send-custom-email error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Internal server error' });
  }
}
