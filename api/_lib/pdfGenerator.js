import { PDFDocument, StandardFonts, PDFName, PDFString } from 'pdf-lib';
import { OFFER_LETTER_TEMPLATE_BASE64 } from './offerLetterTemplateBase64.js';

/**
 * Format a Date object or ISO string to e.g. "21 November 2026" in Asia/Kolkata timezone
 */
export function formatKolkataDate(dateInput) {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  
  return d.toLocaleDateString('en-GB', {
    timeZone: 'Asia/Kolkata',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

/**
 * Server-side Official 2-Page DAKH EDU SOLUTIONS Internship Offer Letter Generator
 * Fills AcroForm fields in `DAKH_Internship_Offer_Letter_Format_10.pdf` directly.
 * 
 * Required exact 9 AcroForm fields:
 * 1. issue_date
 * 2. reference_number
 * 3. student_name
 * 4. college
 * 5. department
 * 6. internship_domain
 * 7. internship_mode
 * 8. internship_duration
 * 9. application_date
 */
export async function generateOfferLetterPdf({
  fullName,
  internNumber,
  college,
  department,
  domain,
  mode,
  internshipDuration,
  dateOfApplication,
  issueDate
}) {
  // 1. Validation of required fields
  const missing = [];
  if (!fullName?.trim()) missing.push('student_name');
  if (!internNumber?.trim()) missing.push('reference_number');
  if (!college?.trim()) missing.push('college');
  if (!department?.trim()) missing.push('department');
  if (!domain?.trim()) missing.push('internship_domain');
  
  if (missing.length > 0) {
    throw new Error(`Cannot generate Offer Letter. Missing required fields: ${missing.join(', ')}`);
  }

  // 2. Prepare field values
  const formattedIssueDate = issueDate ? formatKolkataDate(issueDate) : formatKolkataDate(new Date());
  const formattedAppDate = dateOfApplication ? formatKolkataDate(dateOfApplication) : formattedIssueDate;
  
  // Normalized duration (e.g. "30 days" or "29 days")
  let cleanDuration = (internshipDuration || '30 days').trim();
  if (!cleanDuration.toLowerCase().includes('day') && !cleanDuration.toLowerCase().includes('month')) {
    cleanDuration = `${cleanDuration} days`;
  }
  
  // Normalized mode
  const cleanMode = (mode || 'Online').trim().toLowerCase().includes('offline') ? 'Offline' : 'Online';

  const fieldValues = {
    issue_date: formattedIssueDate,
    reference_number: internNumber.trim(),
    student_name: fullName.trim(),
    college: college.trim(),
    department: department.trim(),
    internship_domain: domain.trim(),
    internship_mode: cleanMode,
    internship_duration: cleanDuration,
    application_date: formattedAppDate
  };

  // 3. Load PDF template from bundled base64 asset
  const templateBytes = Buffer.from(OFFER_LETTER_TEMPLATE_BASE64, 'base64');
  const pdfDoc = await PDFDocument.load(templateBytes);
  const form = pdfDoc.getForm();

  // 4. Use Standard Helvetica Font with template native #182136 styling
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // 5. Fill each AcroForm field explicitly with 11 pt font size, scaling down only if text would clip
  for (const [fieldName, val] of Object.entries(fieldValues)) {
    try {
      const field = form.getTextField(fieldName);
      // Ensure DA contains unescaped standard operator so setFontSize works cleanly
      field.acroField.dict.set(PDFName.of('DA'), PDFString.of('/Helv 11 Tf 0.094118 0.129412 0.211765 rg'));

      // Check available width to prevent clipping
      let targetFontSize = 11;
      const widgets = field.acroField.getWidgets();
      if (widgets && widgets.length > 0) {
        const rect = widgets[0].getRectangle();
        const availableWidth = rect.width - 6; // Leave safety margin
        while (helveticaFont.widthOfTextAtSize(val, targetFontSize) > availableWidth && targetFontSize > 6.5) {
          targetFontSize -= 0.5;
        }
      }

      field.setFontSize(targetFontSize);
      field.setText(val);
      field.updateAppearances(helveticaFont);
    } catch (err) {
      console.warn(`[PDF Generator] Warning setting field "${fieldName}":`, err.message);
    }
  }

  // 6. Flatten generated copy so fields become permanent document content
  form.flatten();

  // 7. Save and return Buffer
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
