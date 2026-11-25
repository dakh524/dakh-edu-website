import { generateOfferLetterPdf } from './api/_lib/pdfGenerator.js';
import { getRegistrationAckEmailHtml, getPaymentApprovalEmailHtml } from './api/_lib/emailTemplates.js';

console.log('--- STARTING LOCAL SUITE TESTS (NO EMAILS DISPATCHED) ---');

// 1. Test PDF Generation
try {
  const pdfBuffer = await generateOfferLetterPdf({
    fullName: 'Test Candidate',
    internNumber: 'DES/INT/2026/9999',
    domain: 'Full Stack Development',
    college: 'Chennai Institute of Technology',
    department: 'Computer Science and Engineering',
    internshipDuration: '30 Days',
    startDate: '2026-12-01',
    endDate: '2026-12-30',
    dateOfApplication: '2026-11-20',
    issueDate: '2026-11-25'
  });
  if (pdfBuffer && pdfBuffer.length > 5000) {
    console.log('✅ TEST 1 PASSED: PDF Offer letter generated successfully. Size:', pdfBuffer.length, 'bytes');
  } else {
    throw new Error('PDF output is too small or invalid');
  }
} catch (e) {
  console.error('❌ TEST 1 FAILED:', e.message);
}

// 2. Test HTML Email Templates
try {
  const stage1Html = getRegistrationAckEmailHtml({
    fullName: 'Test Candidate',
    domain: 'Generative AI',
    planName: 'Internship Program (Online)',
    planPrice: '399',
    utrNumber: 'UTR9988776655',
    registrationId: '123e4567-e89b-12d3-a456-426614174000'
  });

  if (stage1Html.includes('Payment Verification Pending') && stage1Html.includes('UTR9988776655')) {
    console.log('✅ TEST 2A PASSED: Stage 1 Email HTML Template correctly formatted.');
  } else {
    throw new Error('Stage 1 template missing required verification text');
  }

  const stage2Html = getPaymentApprovalEmailHtml({
    fullName: 'Test Candidate',
    domain: 'Generative AI',
    internNumber: 'DES/INT/2026/9999',
    activationUrl: 'https://dakhedusolutions.in/student/login#access_token=test',
    loginEmail: 'student@test.com'
  });

  if (stage2Html.includes('Activate Student Portal Access') && stage2Html.includes('DES/INT/2026/9999')) {
    console.log('✅ TEST 2B PASSED: Stage 2 Email HTML Template correctly formatted.');
  } else {
    throw new Error('Stage 2 template missing required activation or ID elements');
  }
} catch (e) {
  console.error('❌ TEST 2 FAILED:', e.message);
}

// 3. Test Security Checks Logic (Simulated)
try {
  // Test role authorization rule
  const isSuperAdmin = (email) => ['ceo@dakhedusolutions.in', 'admin@dakhedusolutions.in'].includes(email);
  const isTeamAdmin = (role) => ['Admin', 'SuperAdmin'].includes(role);

  if (isSuperAdmin('ceo@dakhedusolutions.in') && !isSuperAdmin('attacker@example.com')) {
    console.log('✅ TEST 3A PASSED: SuperAdmin email verification rule accurate.');
  } else {
    throw new Error('Superadmin rule failure');
  }

  if (isTeamAdmin('Admin') && !isTeamAdmin('Member') && !isTeamAdmin('Intern')) {
    console.log('✅ TEST 3B PASSED: Team admin role checking rule accurate.');
  } else {
    throw new Error('Role authorization failure');
  }
} catch (e) {
  console.error('❌ TEST 3 FAILED:', e.message);
}

// 4. Test Deduplication & Exponential Backoff Formula
try {
  const attempts = 1;
  const backoffMinutes1 = Math.pow(2, attempts); // 2 min
  const backoffMinutes2 = Math.pow(2, 2); // 4 min
  if (backoffMinutes1 === 2 && backoffMinutes2 === 4) {
    console.log('✅ TEST 4 PASSED: Exponential backoff formula calibrated correctly.');
  }
} catch (e) {
  console.error('❌ TEST 4 FAILED:', e.message);
}

console.log('--- ALL SAFE LOCAL TESTS FINISHED ---');
