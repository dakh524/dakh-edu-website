import { supabaseAdmin } from './supabaseServer.js';
import { sendEmailWithRetry } from './resend.js';
import { 
  getRegistrationAckEmailHtml, 
  getPaymentApprovalEmailHtml,
  getProjectSubmissionReminderEmailHtml,
  getCertificateDeliveryEmailHtml
} from './emailTemplates.js';
import { generateOfferLetterPdf } from './pdfGenerator.js';

/**
 * Direct Internal Dispatcher
 * Directly queries pending/failed jobs in email_outbox and dispatches them through Resend,
 * bypassing any HTTP self-fetch or missing secret key blocks.
 */
export async function processOutboxJobsInternal(limit = 10) {
  const results = {
    processed: 0,
    succeeded: 0,
    failed: 0,
    errors: []
  };

  const { data: jobs, error: fetchErr } = await supabaseAdmin
    .from('email_outbox')
    .select('*')
    .in('status', ['pending', 'failed'])
    .lt('attempts', 5)
    .order('created_at', { ascending: true })
    .limit(limit);

  if (fetchErr) {
    console.error('Error fetching email jobs:', fetchErr);
    throw fetchErr;
  }

  if (!jobs || jobs.length === 0) {
    return results;
  }

  for (const job of jobs) {
    results.processed++;
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

        // 1. Resolve student credentials from students table (intern ID and password)
        let internNumber = payload.internNumber;
        let studentPassword = payload.password || payload.tempPassword;

        try {
          let sQuery = supabaseAdmin.from('students').select('*');
          if (job.registration_id) {
            sQuery = sQuery.eq('registration_id', job.registration_id);
          } else if (payload.email) {
            sQuery = sQuery.ilike('email', payload.email.trim());
          }
          const { data: sData } = await sQuery.order('created_at', { ascending: false }).limit(1).maybeSingle();

          if (sData) {
            if (sData.intern_number) internNumber = sData.intern_number;
            if (sData.password) {
              studentPassword = sData.password;
            } else {
              // Generate and save password so both student and admin have it
              studentPassword = `Dakh@${Math.floor(1000 + Math.random() * 9000)}abc`;
              await supabaseAdmin.from('students').update({ password: studentPassword }).eq('id', sData.id);
            }
          } else {
            // Student record does not exist yet; auto-provision
            studentPassword = studentPassword || `Dakh@${Math.floor(1000 + Math.random() * 9000)}abc`;
            try {
              await supabaseAdmin.from('students').insert([{
                registration_id: job.registration_id || null,
                full_name: payload.fullName || 'Student',
                email: payload.email,
                intern_number: internNumber,
                domain: payload.domain,
                duration: payload.internshipDuration,
                start_date: payload.startDate || null,
                end_date: payload.endDate || null,
                password: studentPassword,
                status: 'Active'
              }]);
            } catch (insErr) {
              console.warn('Auto provision student error:', insErr.message);
            }
          }
        } catch (sErr) {
          console.warn('Student record lookup error:', sErr.message);
        }

        if (!studentPassword) {
          studentPassword = `Dakh@${Math.floor(1000 + Math.random() * 9000)}abc`;
        }

        // Generate Official 2-Page Offer Letter PDF from AcroForm Template
        const pdfBuffer = await generateOfferLetterPdf({
          fullName: payload.fullName,
          internNumber: internNumber || payload.internNumber,
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
          internNumber: internNumber || payload.internNumber,
          loginEmail: payload.email,
          password: studentPassword
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

  return results;
}
