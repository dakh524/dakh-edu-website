import { supabaseAdmin } from './supabaseServer.js';
import { sendEmailWithRetry } from './resend.js';
import { getRegistrationAckEmailHtml, getPaymentApprovalEmailHtml } from './emailTemplates.js';

export async function processOutboxJobsInternal(batchSize = 10) {
  const results = {
    processed: 0,
    succeeded: 0,
    failed: 0,
    errors: []
  };

  const { data: jobs, error: jobsError } = await supabaseAdmin.rpc('claim_outbox_jobs', { batch_size: batchSize });

  if (jobsError) {
    console.error('Error claiming outbox jobs:', jobsError);
    throw jobsError;
  }

  if (!jobs || jobs.length === 0) {
    return results;
  }

  for (const job of jobs) {
    results.processed++;
    const payload = job.payload || {};

    try {
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

        await supabaseAdmin.from('registrations').update({
          reg_email_status: 'sent',
          reg_email_sent_at: new Date().toISOString(),
          reg_email_provider_id: emailResult.id
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

  return results;
}
