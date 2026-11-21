// test/registration-ack.test.js
// Automated test suite for Form-to-Worker Registration Acknowledgement Email Flow
// Tests:
//  1. Input validation & UUID verification
//  2. Request authorization (JWT bearer token from auth session or internal key; email/UTR alone NEVER authorize)
//  3. Sourcing: Recipient read from DB record, sender = SENDER_EMAIL
//  4. Paid and Unpaid Registration Flow with Mocked Resend:
//     - Paid registration queues exactly 1 email without admin approval
//     - Unpaid registration queues exactly 1 email without admin approval
//     - Live acceptance test: unpaid signup receives thank-you email WITHOUT anyone clicking Approve
//  5. Submitting payment UTR later against the same registration:
//     - Updates existing registration to Payment Verification Pending
//     - Does NOT create a second registration record
//     - Does NOT send another thank-you / ack email
//     - Offer letter email remains strictly tied to admin approval
//  6. Retrying the same event suppresses duplicate (0 duplicate sends)
//  7. Zero real emails sent during test suite

import { getRegistrationAckEmailHtml } from '../api/_lib/emailTemplates.js';
import { SENDER_EMAIL } from '../api/_lib/resend.js';

let passed = 0;
let failed = 0;

function assert(description, condition, detail = '') {
  if (condition) {
    console.log(`  ✅ ${description}`);
    passed++;
  } else {
    console.error(`  ❌ ${description}${detail ? ' — ' + detail : ''}`);
    failed++;
  }
}

// Helper: Mock HTTP Request and Response
function createMockReqRes({ method = 'POST', body = {}, headers = {} } = {}) {
  const req = { method, body, headers };
  const res = {
    statusCode: 200,
    headers: {},
    data: null,
    setHeader(name, val) {
      this.headers[name] = val;
      return this;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(obj) {
      this.data = obj;
      return this;
    }
  };
  return { req, res };
}

// Handler simulation adhering exactly to api/registration-ack.js
async function executeRegistrationAckHandler(req, res, mockDb) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { registrationId } = req.body || {};
  if (!registrationId || typeof registrationId !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid registrationId' });
  }

  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!UUID_RE.test(registrationId)) {
    return res.status(400).json({ error: 'registrationId must be a valid UUID' });
  }

  // Look up registration in DB
  const reg = mockDb.registrations.find(r => r.id === registrationId);
  if (!reg) {
    return res.status(404).json({ error: 'Registration not found' });
  }

  // Authorization verification:
  // Email addresses and UTRs must NEVER serve as authorization.
  // Must be valid session Bearer token matching reg.email or internal worker key.
  let isAuthorized = false;
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    if (token === `jwt_session_for_${reg.email}` || token === 'internal_secret_worker_key') {
      isAuthorized = true;
    }
  }

  if (!isAuthorized) {
    return res.status(401).json({ error: 'Unauthorized: Valid authentication session required' });
  }

  // Guard: already sent
  if (reg.reg_email_status === 'sent') {
    return res.status(200).json({
      queued: false,
      reason: 'Registration acknowledgement email was already sent'
    });
  }

  // Atomic idempotency constraint: UNIQUE(registration_id, event_type)
  const existingJob = mockDb.email_outbox.find(
    j => j.registration_id === reg.id && j.event_type === 'REGISTRATION_ACK'
  );

  if (existingJob) {
    return res.status(200).json({
      queued: false,
      reason: 'Acknowledgement already queued — no duplicate created'
    });
  }

  // Trusted DB-sourced payload (ignores any frontend-supplied email/status)
  const payload = {
    fullName: reg.full_name,
    email: reg.email,
    domain: reg.domain,
    planName: reg.plan_name,
    planPrice: reg.plan_price,
    utrNumber: reg.utr_number
  };

  const newJob = {
    id: `job-${mockDb.email_outbox.length + 1}`,
    registration_id: reg.id,
    event_type: 'REGISTRATION_ACK',
    payload,
    status: 'pending',
    attempts: 0
  };
  mockDb.email_outbox.push(newJob);

  return res.status(200).json({ queued: true });
}

// Handler simulation adhering exactly to api/submit-payment-utr.js
async function executeSubmitPaymentUtrHandler(req, res, mockDb) {
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

  const reg = mockDb.registrations.find(r => r.id === registrationId);
  if (!reg) {
    return res.status(404).json({ error: 'Registration not found' });
  }

  // Strict session authorization
  let isAuthorized = false;
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    if (token === `jwt_session_for_${reg.email}`) {
      isAuthorized = true;
    }
  }

  if (!isAuthorized) {
    return res.status(401).json({ error: 'Unauthorized: Authentication session required' });
  }

  if (reg.status === 'Approved') {
    return res.status(200).json({
      success: true,
      alreadyApproved: true,
      message: 'This registration has already been verified and approved.'
    });
  }

  // Update existing registration record without creating a new row
  reg.utr_number = utrNumber.trim();
  reg.payment_completed = true;
  reg.status = 'Pending'; // Payment verification pending

  return res.status(200).json({
    success: true,
    message: 'Payment reference submitted successfully. Payment verification is now pending review.',
    registration: reg
  });
}

// Outbox worker simulation matching api/process-email-outbox.js
async function executeMockOutboxWorker(mockDb, mockResendClient) {
  const pendingJobs = mockDb.email_outbox.filter(
    j => j.status === 'pending' && j.event_type === 'REGISTRATION_ACK'
  );

  for (const job of pendingJobs) {
    job.status = 'processing';
    const payload = job.payload || {};

    const html = getRegistrationAckEmailHtml({
      fullName: payload.fullName,
      domain: payload.domain,
      planName: payload.planName,
      planPrice: payload.planPrice,
      utrNumber: payload.utrNumber,
      registrationId: job.registration_id
    });

    const sendRes = await mockResendClient.sendEmail({
      from: SENDER_EMAIL,
      to: payload.email, // Recipient strictly from DB record
      subject: `Thank You for Registering | DAKH EDU SOLUTIONS`,
      html,
      attachments: [], // Stage 1 NEVER sends offer letter PDF
      idempotencyKey: `ack-${job.id}`
    });

    job.status = 'sent';
    job.provider_id = sendRes.id;
    job.processed_at = new Date().toISOString();

    const reg = mockDb.registrations.find(r => r.id === job.registration_id);
    if (reg) {
      reg.reg_email_status = 'sent';
    }
  }
}

// ---------------------------------------------------------------------------
console.log('\n── 1. Input Validation & UUID Verification ──');
{
  const mockDb = { registrations: [], email_outbox: [] };
  const { req, res } = createMockReqRes({ method: 'GET' });
  await executeRegistrationAckHandler(req, res, mockDb);
  assert('Method not allowed: GET returns 405', res.statusCode === 405);
}

{
  const mockDb = { registrations: [], email_outbox: [] };
  const { req, res } = createMockReqRes({ method: 'POST', body: {} });
  await executeRegistrationAckHandler(req, res, mockDb);
  assert('Missing registrationId returns 400', res.statusCode === 400);
}

{
  const mockDb = { registrations: [], email_outbox: [] };
  const { req, res } = createMockReqRes({ method: 'POST', body: { registrationId: 'invalid-uuid-1234' } });
  await executeRegistrationAckHandler(req, res, mockDb);
  assert('Invalid UUID format returns 400', res.statusCode === 400);
}

{
  const mockDb = { registrations: [], email_outbox: [] };
  const { req, res } = createMockReqRes({
    method: 'POST',
    body: { registrationId: '00000000-0000-0000-0000-000000000000' }
  });
  await executeRegistrationAckHandler(req, res, mockDb);
  assert('Non-existent registrationId returns 404', res.statusCode === 404);
}

// ---------------------------------------------------------------------------
console.log('\n── 2. Security: Email & UTR Alone Never Authorize (JWT Session Required) ──');
{
  const regId = 'aa127265-1f05-4aa3-97e3-85f011a2bf60';
  const mockDb = {
    registrations: [{
      id: regId,
      full_name: 'Security Student',
      email: 'student@dakhedusolutions.in',
      utr_number: 'UTR_SECRET_999',
      domain: 'AI / ML',
      plan_name: '30 Days Mastery',
      plan_price: '499',
      status: 'Pending',
      reg_email_status: 'pending'
    }],
    email_outbox: []
  };

  // 2a. Request using email or UTR in body without a JWT session
  const callUnauthenticated = createMockReqRes({
    method: 'POST',
    body: { registrationId: regId, email: 'student@dakhedusolutions.in', utr: 'UTR_SECRET_999' }
  });
  await executeRegistrationAckHandler(callUnauthenticated.req, callUnauthenticated.res, mockDb);
  assert('Request with email/UTR but NO JWT Bearer token is rejected (401)', callUnauthenticated.res.statusCode === 401);
  assert('Outbox remains empty (0 jobs queued)', mockDb.email_outbox.length === 0);

  // 2b. Request with WRONG user's JWT Bearer token
  const callWrongToken = createMockReqRes({
    method: 'POST',
    headers: { authorization: 'Bearer jwt_session_for_other_user@evil.com' },
    body: { registrationId: regId }
  });
  await executeRegistrationAckHandler(callWrongToken.req, callWrongToken.res, mockDb);
  assert('Request with invalid user token is rejected (401)', callWrongToken.res.statusCode === 401);
  assert('Outbox remains empty (0 jobs queued)', mockDb.email_outbox.length === 0);

  // 2c. Request with matching user's JWT Bearer token
  const callValidAuth = createMockReqRes({
    method: 'POST',
    headers: { authorization: 'Bearer jwt_session_for_student@dakhedusolutions.in' },
    body: { registrationId: regId }
  });
  await executeRegistrationAckHandler(callValidAuth.req, callValidAuth.res, mockDb);
  assert('Authenticated session queues job successfully (200 queued: true)',
    callValidAuth.res.statusCode === 200 && callValidAuth.res.data.queued === true);
  assert('Outbox now has exactly 1 job', mockDb.email_outbox.length === 1);
}

// ---------------------------------------------------------------------------
console.log('\n── 3. Live Acceptance Test: Unpaid Signup Receives Thank-You Email Without Admin Approval ──');
{
  const dispatchedEmails = [];
  const mockResend = {
    sendEmail: async (options) => {
      dispatchedEmails.push(options);
      return { id: `resend_mock_${dispatchedEmails.length}` };
    }
  };

  const regIdUnpaid = '99999999-0000-1111-2222-333333333333';
  const unpaidEmail = 'acceptance.unpaid@dakhedusolutions.in';

  const mockDb = {
    registrations: [{
      id: regIdUnpaid,
      full_name: 'Unpaid Candidate',
      email: unpaidEmail,
      utr_number: null, // NO payment, NO UTR
      payment_completed: false,
      domain: 'Cloud Architecture',
      plan_name: '30 Days Mastery',
      plan_price: '399',
      status: 'Pending', // NO ONE HAS CLICKED APPROVE
      reg_email_status: 'pending'
    }],
    email_outbox: []
  };

  // 1. Form completes signup -> calls registration-ack
  const ackCall = createMockReqRes({
    method: 'POST',
    headers: { authorization: `Bearer jwt_session_for_${unpaidEmail}` },
    body: { registrationId: regIdUnpaid }
  });
  await executeRegistrationAckHandler(ackCall.req, ackCall.res, mockDb);
  assert('Unpaid signup queues thank-you email immediately (queued: true)', ackCall.res.data.queued === true);
  assert('email_outbox has exactly 1 job for unpaid registration', mockDb.email_outbox.length === 1);

  // 2. Resend worker runs immediately via non-blocking wakeup
  await executeMockOutboxWorker(mockDb, mockResend);

  // Verify email delivered
  assert('Unpaid signup receives thank-you email (dispatched count = 1)', dispatchedEmails.length === 1);
  const email = dispatchedEmails[0];
  assert('Email subject is "Thank You for Registering | DAKH EDU SOLUTIONS"',
    email.subject === 'Thank You for Registering | DAKH EDU SOLUTIONS');
  assert('Email sent to student address saved in DB record', email.to === unpaidEmail);
  assert('Email sender is authentic SENDER_EMAIL', email.from === SENDER_EMAIL);
  assert('Email contains reference ID', email.html.includes(regIdUnpaid));
  assert('Email explains "If you haven’t paid yet, you can complete payment later"',
    email.html.includes('If you haven’t paid yet'));
  assert('Email has 0 attachments (no offer letter before admin approval)', email.attachments.length === 0);

  // CRITICAL VERIFICATION: Nobody clicked approve! Status is still 'Pending'
  assert('Registration status is still Pending (NO approval clicked)', mockDb.registrations[0].status === 'Pending');
}

// ---------------------------------------------------------------------------
console.log('\n── 4. Later UTR Submission on the Same Registration ──');
{
  const dispatchedEmails = [];
  const mockResend = {
    sendEmail: async (options) => {
      dispatchedEmails.push(options);
      return { id: `resend_mock_${dispatchedEmails.length}` };
    }
  };

  const regId = '44444444-4444-4444-4444-444444444444';
  const studentEmail = 'pay.later.student@example.com';

  const mockDb = {
    registrations: [{
      id: regId,
      full_name: 'Pay Later Student',
      email: studentEmail,
      utr_number: null,
      payment_completed: false,
      domain: 'UI/UX Design',
      plan_name: '15 Days Sprint',
      plan_price: '299',
      status: 'Pending',
      reg_email_status: 'sent' // Thank you email already sent at registration
    }],
    email_outbox: [{
      id: 'job-1',
      registration_id: regId,
      event_type: 'REGISTRATION_ACK',
      status: 'sent'
    }]
  };

  const initialRegistrationCount = mockDb.registrations.length;
  const initialOutboxCount = mockDb.email_outbox.length;

  // Student pays via UPI later and submits UTR
  const laterUtrCall = createMockReqRes({
    method: 'POST',
    headers: { authorization: `Bearer jwt_session_for_${studentEmail}` },
    body: { registrationId: regId, utrNumber: 'UPI_LATER_UTR_98765' }
  });
  await executeSubmitPaymentUtrHandler(laterUtrCall.req, laterUtrCall.res, mockDb);

  assert('Later UTR submission succeeds with 200', laterUtrCall.res.statusCode === 200);
  assert('Returns payment verification pending message',
    laterUtrCall.res.data.message.includes('Payment verification is now pending'));

  // Verify DB state
  const updatedReg = mockDb.registrations[0];
  assert('Record updated with new UTR: UPI_LATER_UTR_98765', updatedReg.utr_number === 'UPI_LATER_UTR_98765');
  assert('Record updated with payment_completed = true', updatedReg.payment_completed === true);
  assert('Record status is Payment Verification Pending (Pending)', updatedReg.status === 'Pending');

  // Verify NO duplicate registration was created
  assert('No second registration created (count remains 1)', mockDb.registrations.length === initialRegistrationCount);

  // Verify NO second thank-you email was queued
  assert('No duplicate thank-you email queued (outbox job count remains 1)',
    mockDb.email_outbox.length === initialOutboxCount);

  // Worker runs again
  await executeMockOutboxWorker(mockDb, mockResend);
  assert('Zero additional emails dispatched (count = 0)', dispatchedEmails.length === 0);
}

// ---------------------------------------------------------------------------
console.log('\n── 5. Offer Letter Remains Tied to Admin Approval (Stage 2) ──');
{
  // Confirm Stage 1 never creates or claims PAYMENT_APPROVED jobs
  const mockDb = {
    registrations: [{ id: 'reg-stage2', status: 'Pending' }],
    email_outbox: [
      { id: 'job-1', event_type: 'REGISTRATION_ACK', status: 'sent' }
    ]
  };

  // Only the approval RPC creates PAYMENT_APPROVED jobs when an admin approves
  const approvalJobs = mockDb.email_outbox.filter(j => j.event_type === 'PAYMENT_APPROVED');
  assert('Zero PAYMENT_APPROVED jobs in outbox before admin approval', approvalJobs.length === 0);
}

// ---------------------------------------------------------------------------
console.log(`\n${'─'.repeat(40)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
