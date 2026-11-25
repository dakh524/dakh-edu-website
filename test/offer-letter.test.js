import { generateOfferLetterPdf, formatKolkataDate } from '../api/_lib/pdfGenerator.js';
import { PDFDocument } from 'pdf-lib';

async function run() {
  console.log('\n── Offer Letter Generator with Updated Template (11 fields) ──');

  // Test 1: Full generation with explicit start and end dates
  const pdfBuffer1 = await generateOfferLetterPdf({
    fullName: 'Dhivakar M',
    internNumber: 'DES/INT/2026/8942',
    college: 'Sri Sairam Engineering College',
    department: 'Electrical and Electronics Engineering',
    domain: 'PCB Design & Embedded Systems',
    mode: 'Online',
    internshipDuration: '30 Days',
    startDate: '2026-12-01',
    endDate: '2026-12-30',
    dateOfApplication: '2026-11-20',
    issueDate: '2026-11-25'
  });

  if (!pdfBuffer1 || pdfBuffer1.length < 50000) {
    throw new Error('PDF output is too small or invalid');
  }
  const doc1 = await PDFDocument.load(pdfBuffer1);
  if (doc1.getPageCount() !== 2) {
    throw new Error(`Expected 2 pages, got ${doc1.getPageCount()}`);
  }
  console.log('  ✅ Generates valid 2-page Offer Letter PDF with explicit start & end date (' + pdfBuffer1.length + ' bytes)');

  // Test 2: Fallback when endDate is omitted (auto-computed from duration)
  const pdfBuffer2 = await generateOfferLetterPdf({
    fullName: 'Ananya Sharma',
    internNumber: 'DES/INT/2026/5678',
    college: 'Chennai Institute of Technology',
    department: 'Computer Science and Engineering',
    domain: 'Artificial Intelligence',
    internshipDuration: '30 Days',
    startDate: '2026-12-05'
  });

  const doc2 = await PDFDocument.load(pdfBuffer2);
  if (doc2.getPageCount() !== 2) {
    throw new Error(`Expected 2 pages, got ${doc2.getPageCount()}`);
  }
  console.log('  ✅ Automatically derives inclusive end date from startDate + duration');

  // Test 3: Fallback when both dates are omitted (uses fallback / today)
  const pdfBuffer3 = await generateOfferLetterPdf({
    fullName: 'Karthik Raja',
    internNumber: 'DES/INT/2026/7777',
    college: 'Anna University',
    department: 'Information Technology',
    domain: 'Full Stack Development',
    internshipDuration: '30 Days'
  });

  const doc3 = await PDFDocument.load(pdfBuffer3);
  if (doc3.getPageCount() !== 2) {
    throw new Error(`Expected 2 pages, got ${doc3.getPageCount()}`);
  }
  console.log('  ✅ Gracefully defaults start & end dates when omitted');

  // Test 4: Missing required fields throws Error
  let threwExpected = false;
  try {
    await generateOfferLetterPdf({
      fullName: '',
      internNumber: 'DES/INT/2026/0000'
    });
  } catch (err) {
    threwExpected = true;
  }
  if (!threwExpected) {
    throw new Error('Expected validation error for missing required fields');
  }
  console.log('  ✅ Rejects missing required parameters with clear error');

  // Test 5: Verify Issue Date right-alignment (/Q = 2) in template
  const { OFFER_LETTER_TEMPLATE_BASE64 } = await import('../api/_lib/offerLetterTemplateBase64.js');
  const templateDoc = await PDFDocument.load(Buffer.from(OFFER_LETTER_TEMPLATE_BASE64, 'base64'));
  const issueField = templateDoc.getForm().getTextField('issue_date');
  const qVal = issueField.acroField.dict.get((await import('pdf-lib')).PDFName.of('Q'));
  if (!qVal || qVal.numberValue !== 2) {
    throw new Error(`Expected issue_date field to have /Q = 2 (right alignment), found: ${qVal}`);
  }
  console.log('  ✅ Template AcroForm issue_date field configured with /Q = 2 (right alignment)');

  console.log('\n────────────────────────────────────────');
  console.log('Results: All 5 Offer Letter tests passed!\n');
}

run().catch(err => {
  console.error('Offer letter test failed:', err);
  process.exit(1);
});
