import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
export const resend = resendApiKey ? new Resend(resendApiKey) : null;

export const SENDER_EMAIL = process.env.SENDER_EMAIL || 'DAKH EDU SOLUTIONS <noreply@dakhedusolutions.in>';

/**
 * Send email with bounded retry and backoff
 */
export async function sendEmailWithRetry({ to, subject, html, attachments = [], idempotencyKey, maxRetries = 2 }) {
  if (!resend) {
    throw new Error('RESEND_API_KEY is not configured on the server.');
  }

  let attempt = 0;
  let lastError = null;

  while (attempt <= maxRetries) {
    try {
      const response = await resend.emails.send({
        from: SENDER_EMAIL,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        attachments,
        headers: idempotencyKey ? {
          'Idempotency-Key': idempotencyKey
        } : undefined
      });

      if (response.error) {
        throw new Error(response.error.message || JSON.stringify(response.error));
      }

      return {
        success: true,
        id: response.data?.id
      };
    } catch (err) {
      lastError = err;
      attempt++;
      if (attempt <= maxRetries) {
        // Exponential backoff: 1s, 2s...
        await new Promise(res => setTimeout(res, attempt * 1000));
      }
    }
  }

  throw lastError || new Error('Failed to send email after retries');
}
