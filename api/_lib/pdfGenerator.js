import { jsPDF } from 'jspdf';
import { TEMPLATE_BASE64 } from './templateAsset.js';

/**
 * Server-side Official A4 Offer Letter PDF Generator
 * Exclusively uses `public/templates/offer-letter-template.png` (bundled directly via TEMPLATE_BASE64)
 * as the 1-PAGE official A4 background.
 * Overlays dynamic verified student data onto table rows with precision text fitting.
 */
export function generateOfferLetterPdf({
  fullName = '',
  internNumber = '',
  college = '',
  department = '',
  year = '',
  domain = '',
  internshipDuration = '',
  startDate = '',
  endDate = '',
  utrNumber = '',
  dateOfApplication = '',
  phone = '',
  email = '',
  issueDate = ''
}) {
  console.log(`[PDF Generator] Generating official 1-PAGE offer letter for intern: ${internNumber || 'NEW'}, candidate: ${fullName}`);

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 210;
  const pageHeight = 297;

  // 1. Embed Authentic Full-Page A4 Background (Page 1 Only)
  if (TEMPLATE_BASE64) {
    const imgData = `data:image/png;base64,${TEMPLATE_BASE64}`;
    doc.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight, undefined, 'FAST');
  } else {
    console.warn('[PDF Generator] Warning: TEMPLATE_BASE64 is empty!');
  }

  // Set font styling for overlay
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59); // Crisp dark slate

  // 2. Ref No (Header Line)
  // Ref underline is at ~56mm X, 48.2mm Y
  doc.setFontSize(9);
  const cleanRef = (internNumber || 'DAKH/INTERN/2026/001').replace(/^DAKH\/INTERN\//i, '').replace(/^DES\/INT\/2026\//i, '2026/');
  doc.text(cleanRef, 56, 48.2);

  // 3. Issue Date (Header Line)
  // Date line is at ~167mm X, 48.2mm Y
  const finalIssueDate = issueDate || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  doc.text(finalIssueDate, 167, 48.2);

  // 4. Salutation "Dear [Name],"
  // Dear line begins at ~23mm X, 71.0mm Y
  doc.setFontSize(10);
  doc.text(`${fullName || 'Candidate'},`, 23, 71.0);

  // 5. Official Table Dynamic Data Overlay
  // Col 2 start: X = 64mm, available width = 130mm (from 64mm to 196mm)
  const col2X = 64;
  const maxColWidth = 130;

  // Compute duration display string
  let durationStr = internshipDuration;
  if (!durationStr && startDate && endDate) {
    durationStr = `${startDate} to ${endDate}`;
  } else if (!durationStr) {
    durationStr = '30 Days (Batch 2026)';
  }

  // Helper function to print text safely without overflowing cell
  const printCell = (text, yPos, defaultSize = 8.5) => {
    if (!text) text = '—';
    doc.setFontSize(defaultSize);
    let str = String(text).trim();
    let textWidth = doc.getTextWidth(str);

    // If text exceeds cell width, downscale font or truncate with ellipsis
    if (textWidth > maxColWidth) {
      doc.setFontSize(defaultSize - 1.5);
      textWidth = doc.getTextWidth(str);
      if (textWidth > maxColWidth) {
        while (str.length > 10 && doc.getTextWidth(str + '...') > maxColWidth) {
          str = str.slice(0, -1);
        }
        str += '...';
      }
    }
    doc.text(str, col2X, yPos);
  };

  // Table Row Mapping (Calculated Y coordinates matching PNG pixel positions)
  // Row 1: Name -> Y = 98.2mm
  printCell(fullName, 98.2, 9);

  // Row 2: College -> Y = 104.0mm
  printCell(college, 104.0, 8.5);

  // Row 3: Department -> Y = 109.5mm
  printCell(department, 109.5, 8.5);

  // Row 4: Year -> Y = 115.2mm
  printCell(year, 115.2, 8.5);

  // Row 5: Domain -> Y = 121.0mm
  printCell(domain, 121.0, 9);

  // Row 6: Internship Duration -> Y = 126.8mm
  printCell(durationStr, 126.8, 8.5);

  // Row 7: Transaction ID -> Y = 132.5mm
  printCell(utrNumber, 132.5, 8.5);

  // Row 8: Date of Application -> Y = 138.2mm
  printCell(dateOfApplication || finalIssueDate, 138.2, 8.5);

  // Row 9: Phone -> Y = 144.0mm
  printCell(phone, 144.0, 8.5);

  // Row 10: Email -> Y = 149.5mm
  printCell(email, 149.5, 8.5);

  // Verify page count: STRICTLY 1 PAGE
  const totalPages = doc.internal.getNumberOfPages();
  if (totalPages !== 1) {
    console.error(`[PDF Generator] Critical: Expected 1 page but document has ${totalPages} pages!`);
  }

  // Output Node Buffer
  const arrayBuffer = doc.output('arraybuffer');
  return Buffer.from(arrayBuffer);
}
