import { supabaseAdmin } from './_lib/supabaseServer.js';
import { sendEmailWithRetry } from './_lib/resend.js';
import { 
  getRegistrationAckEmailHtml, 
  getPaymentApprovalEmailHtml,
  getProjectSubmissionReminderEmailHtml,
  getCertificateDeliveryEmailHtml
} from './_lib/emailTemplates.js';
import { generateOfferLetterPdf } from './_lib/pdfGenerator.js';

/**
 * Scheduled / Trusted Worker: Process Pending Email Outbox
 * Processes all 4 Lifecycle Email Events:
 * 1. REGISTRATION_ACK
 * 2. PAYMENT_APPROVED
 * 3. PROJECT_REMINDER
 * 4. CERTIFICATE_DISPATCH
 */
export default async function handler(req, res) {
  const cronSecret = process.env.CRON_SECRET;
  const internalKey = process.env.INTERNAL_WORKER_KEY || cronSecret || process.env.SUPABASE_SECRET_KEY;
  const isVercelCron = req.headers['x-vercel-cron'] === '1';
  
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
  const headerKey = req.headers['x-worker-key'];

  const isAuthorized = 
    isVercelCron || 
    (token && token === internalKey) || 
    (headerKey && headerKey === internalKey) ||
    process.env.NODE_ENV === 'development';

  if (!isAuthorized) {
    return res.status(401).json({ error: 'Unauthorized: invalid worker key or credentials' });
  }

  try {
    const { data: pendingJobs, error: fetchErr } = await supabaseAdmin
      .from('email_outbox')
      .select('*')
      .in('status', ['pending', 'failed'])
      .lt('attempts', 5)
      .order('created_at', { ascending: true })
      .limit(15);

    if (fetchErr) {
      console.error('Error fetching email jobs:', fetchErr);
      return res.status(500).json({ error: fetchErr.message });
    }

    if (!pendingJobs || pendingJobs.length === 0) {
      return res.status(200).json({ message: 'No pending email jobs in outbox.' });
    }

    const results = { total: pendingJobs.length, succeeded: 0, failed: 0, errors: [] };

    for (const job of pendingJobs) {
      const payload = job.payload || {};
      
      try {
        await supabaseAdmin.from('email_outbox').update({
          status: 'processing',
          attempts: (job.attempts || 0) + 1,
          last_attempt_at: new Date().toISOString()
        }).eq('id', job.id);

        if (job.event_type === 'REGISTRATION_ACK') {
          console.log(`[Email Dispatch] Processing Stage 1 REGISTRATION_ACK for job ${job.id}`);
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
            subject: `Thank You for Registering | DAKH EDU SOLUTIONS`,
            html,
            attachments: [],
            idempotencyKey: `ack-${job.id}`
          });

          await supabaseAdmin.from('email_outbox').update({
            status: 'sent',
            provider_id: emailResult.id,
            processed_at: new Date().toISOString()
          }).eq('id', job.id);

          if (job.registration_id) {
            await supabaseAdmin.from('registrations').update({
              reg_email_status: 'sent',
              reg_email_sent_at: new Date().toISOString(),
              reg_email_provider_id: emailResult.id
            }).eq('id', job.registration_id);
          }

          results.succeeded++;

        } else if (job.event_type === 'PAYMENT_APPROVED') {
          console.log(`[Email Dispatch] Processing Stage 2 PAYMENT_APPROVED for job ${job.id}`);
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

          // Generate Official 2-Page Offer Letter PDF from AcroForm Template
          const pdfBuffer = await generateOfferLetterPdf({
            fullName: payload.fullName,
            internNumber: payload.internNumber,
            college: payload.college,
            department: payload.department,
            domain: payload.domain,
            mode: payload.mode || 'Online',
            internshipDuration: payload.internshipDuration || (payload.startDate && payload.endDate ? `${payload.startDate} to ${payload.endDate}` : '30 Days'),
            startDate: payload.startDate || null,
            endDate: payload.endDate || null,
            dateOfApplication: payload.dateOfApplication || job.created_at || new Date(),
            issueDate: new Date()
          });

          const html = getPaymentApprovalEmailHtml({
            fullName: payload.fullName,
            domain: payload.domain,
            internNumber: payload.internNumber,
            activationUrl,
            loginEmail: payload.email,
            password: payload.password || payload.tempPassword || 'Set during signup / Click link below'
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

          if (job.registration_id) {
            await supabaseAdmin.from('registrations').update({
              approval_email_status: 'sent',
              approval_email_sent_at: new Date().toISOString(),
              approval_email_provider_id: emailResult.id
            }).eq('id', job.registration_id);
          }

          results.succeeded++;

        } else if (job.event_type === 'PROJECT_REMINDER') {
          console.log(`[Email Dispatch] Processing Stage 3 PROJECT_REMINDER for job ${job.id}`);
          const html = getProjectSubmissionReminderEmailHtml({
            fullName: payload.fullName,
            internNumber: payload.internNumber,
            domain: payload.domain,
            endDate: payload.endDate
          });

          const emailResult = await sendEmailWithRetry({
            to: payload.email,
            subject: `Action Required: Internship Project Submission – DAKH EDU SOLUTIONS`,
            html,
            attachments: [],
            idempotencyKey: `reminder-${job.id}`
          });

          await supabaseAdmin.from('email_outbox').update({
            status: 'sent',
            provider_id: emailResult.id,
            processed_at: new Date().toISOString()
          }).eq('id', job.id);

          if (job.registration_id) {
            await supabaseAdmin.from('registrations').update({
              reminder_email_status: 'sent',
              reminder_email_sent_at: new Date().toISOString()
            }).eq('id', job.registration_id);
          }

          results.succeeded++;

        } else if (job.event_type === 'CERTIFICATE_DISPATCH') {
          console.log(`[Email Dispatch] Processing Stage 4 CERTIFICATE_DISPATCH for job ${job.id}`);
          const html = getCertificateDeliveryEmailHtml({
            fullName: payload.fullName,
            internNumber: payload.internNumber,
            domain: payload.domain,
            certificateLink: payload.certificateLink
          });

          const attachments = [];
          if (payload.pdfBase64) {
            const safeName = (payload.fullName || 'Student').replace(/[^a-zA-Z0-9]/g, '_');
            attachments.push({
              filename: `DAKH_Certificate_${safeName}.pdf`,
              content: payload.pdfBase64
            });
          }

          const emailResult = await sendEmailWithRetry({
            to: payload.email,
            subject: `🎉 Internship Completion Certificate – DAKH EDU SOLUTIONS`,
            html,
            attachments,
            idempotencyKey: `cert-${job.id}`
          });

          await supabaseAdmin.from('email_outbox').update({
            status: 'sent',
            provider_id: emailResult.id,
            processed_at: new Date().toISOString()
          }).eq('id', job.id);

          if (job.registration_id) {
            await supabaseAdmin.from('registrations').update({
              cert_email_status: 'sent',
              cert_email_sent_at: new Date().toISOString()
            }).eq('id', job.registration_id);
          }

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
    console.error('Unhandled outbox processor failure:', globalErr);
    return res.status(500).json({ error: globalErr.message });
  }
}
