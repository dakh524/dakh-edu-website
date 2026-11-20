import { supabaseAdmin } from './_lib/supabaseServer.js';
import { sendEmailWithRetry } from './_lib/resend.js';
import { getRegistrationAckEmailHtml, getPaymentApprovalEmailHtml } from './_lib/emailTemplates.js';
import { generateOfferLetterPdf } from './_lib/pdfGenerator.js';

/**
 * Scheduled / Trusted Worker: Process Pending Email Outbox
 */
export default async function handler(req, res) {
  const cronSecret = process.env.CRON_SECRET;
  const internalKey = process.env.INTERNAL_WORKER_KEY || cronSecret;
  const isVercelCron = req.headers['x-vercel-cron'] === '1';
  
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
  const headerKey = req.headers['x-worker-key'];

  const isAuthorized = 
    isVercelCron || 
    (cronSecret && token === cronSecret) || 
    (internalKey && headerKey === internalKey);

  if (!isAuthorized) {
    return res.status(403).json({ error: 'Forbidden: Unauthorized worker invocation' });
  }

  const results = {
    processed: 0,
    succeeded: 0,
    failed: 0,
    errors: []
  };

  try {
    const { data: jobs, error: jobsError } = await supabaseAdmin.rpc('claim_outbox_jobs', { batch_size: 10 });

    if (jobsError) {
      console.error('Error claiming outbox jobs:', jobsError);
      return res.status(500).json({ error: jobsError.message });
    }

    if (!jobs || jobs.length === 0) {
      return res.status(200).json({ message: 'No pending email jobs in outbox.', results });
    }

    for (const job of jobs) {
      results.processed++;
      const payload = job.payload || {};

      try {
        if (job.event_type === 'REGISTRATION_ACK') {
          const html = getRegistrationAckEmailHtml({
            fullName: payload.fullName,
            domain: payload.domain,
            planName: payload.planName,
            planPrice: payload.planPrice,
            utrNumber: payload.utrNumber,
            registrationId: job.registration_id
          });

          const emailResult = await sendEmailWithRetry({
            to: payload.email,
            subject: `🎉 Registration Received: ${payload.domain} Internship – DAKH EDU SOLUTIONS`,
            html,
            idempotencyKey: `ack-${job.id}`
          });

          await supabaseAdmin.from('email_outbox').update({
            status: 'sent',
            provider_id: emailResult.id,
            processed_at: new Date().toISOString()
          }).eq('id', job.id);

          await supabaseAdmin.from('registrations').update({
            reg_email_status: 'sent',
            reg_email_sent_at: new Date().toISOString(),
            reg_email_provider_id: emailResult.id
          }).eq('id', job.registration_id);

          results.succeeded++;

        } else if (job.event_type === 'PAYMENT_APPROVED') {
          let activationUrl = '';
          try {
            const { data: linkData, error: linkErr } = await supabaseAdmin.auth.admin.generateLink({
              type: 'magiclink',
              email: payload.email,
              options: {
                redirectTo: `${process.env.VITE_APP_URL || 'https://dakhedusolutions.in'}/student/login`
              }
            });
            if (!linkErr && linkData?.properties?.action_link) {
              activationUrl = linkData.properties.action_link;
            }
          } catch (authErr) {
            console.warn('Could not generate magic link, fallback to login page:', authErr);
          }

          // Generate A4 Official Offer Letter PDF with Authentic Template Background
          const pdfBuffer = generateOfferLetterPdf({
            fullName: payload.fullName,
            internNumber: payload.internNumber,
            college: payload.college,
            department: payload.department,
            year: payload.year,
            domain: payload.domain,
            internshipDuration: payload.internshipDuration || (payload.startDate && payload.endDate ? `${payload.startDate} to ${payload.endDate}` : '30 Days'),
            startDate: payload.startDate,
            endDate: payload.endDate,
            utrNumber: payload.utrNumber,
            dateOfApplication: payload.dateOfApplication ? new Date(payload.dateOfApplication).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '',
            phone: payload.phone,
            email: payload.email,
            issueDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
          });

          const html = getPaymentApprovalEmailHtml({
            fullName: payload.fullName,
            domain: payload.domain,
            internNumber: payload.internNumber,
            activationUrl,
            loginEmail: payload.email
          });

          const safeName = (payload.fullName || 'Student').replace(/[^a-zA-Z0-9]/g, '_');
          const emailResult = await sendEmailWithRetry({
            to: payload.email,
            subject: `🎉 Payment Approved & Official Offer Letter – DAKH EDU SOLUTIONS`,
            html,
            attachments: [
              {
                filename: `DAKH_Offer_Letter_${safeName}.pdf`,
                content: pdfBuffer.toString('base64')
              }
            ],
            idempotencyKey: `approval-${job.id}`
          });

          await supabaseAdmin.from('email_outbox').update({
            status: 'sent',
            provider_id: emailResult.id,
            processed_at: new Date().toISOString()
          }).eq('id', job.id);

          await supabaseAdmin.from('registrations').update({
            approval_email_status: 'sent',
            approval_email_sent_at: new Date().toISOString(),
            approval_email_provider_id: emailResult.id
          }).eq('id', job.registration_id);

          results.succeeded++;
        }
      } catch (err) {
        console.error(`Failed job ${job.id}:`, err);
        results.failed++;
        results.errors.push({ jobId: job.id, error: err.message });

        await supabaseAdmin.from('email_outbox').update({
          status: 'failed',
          last_error: err.message,
          last_attempt_at: new Date().toISOString()
        }).eq('id', job.id);
      }
    }

    return res.status(200).json({ message: 'Outbox processing completed.', results });
  } catch (globalErr) {
    console.error('Fatal outbox runner error:', globalErr);
    return res.status(500).json({ error: globalErr.message });
  }
}
