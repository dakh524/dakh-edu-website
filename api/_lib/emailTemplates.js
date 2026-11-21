/**
 * Branded responsive email templates for DAKH EDU SOLUTIONS
 */

const LOGO_URL = 'https://dakhedusolutions.in/companylogo.jpg';

/**
 * Stage 1: Immediate Registration Confirmation (Sent to paid & unpaid applicants)
 */
export function getRegistrationAckEmailHtml({
  fullName,
  domain,
  planName,
  planPrice,
  utrNumber,
  registrationId
}) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thank You for Registering | DAKH EDU SOLUTIONS</title>
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f8fafc;padding:30px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 25px rgba(0,0,0,0.05);border:1px solid #e2e8f0;">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg, #4a154b 0%, #1e1b4b 100%);padding:35px 30px;text-align:center;">
              <h1 style="color:#ffffff;font-size:24px;font-weight:800;letter-spacing:1px;margin:0 0 8px 0;text-transform:uppercase;">
                DAKH EDU SOLUTIONS
              </h1>
              <p style="color:#fcd34d;font-size:14px;font-weight:600;margin:0;letter-spacing:0.5px;">
                Empowering Minds, Engineering Futures
              </p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding:35px 30px;">
              <p style="font-size:16px;line-height:1.6;color:#1e293b;margin:0 0 16px 0;">
                Dear ${fullName},
              </p>

              <p style="font-size:15px;line-height:1.6;color:#334155;margin:0 0 16px 0;">
                Thank you for registering for the <strong>${domain} Internship Program</strong> at <strong>DAKH EDU SOLUTIONS</strong>. We’ve received your registration successfully.
              </p>

              <p style="font-size:15px;line-height:1.6;color:#334155;margin:0 0 20px 0;">
                Your registration reference is <strong>${registrationId}</strong>. Please keep it handy if you need to contact us about your registration.
              </p>

              <!-- What happens next box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f1f5f9;border-radius:12px;padding:20px;margin-bottom:24px;">
                <tr>
                  <td>
                    <h3 style="font-size:15px;font-weight:700;color:#0f172a;margin:0 0 10px 0;">
                      Next Steps
                    </h3>
                    <p style="font-size:14px;line-height:1.6;color:#475569;margin:0 0 10px 0;">
                      • If you have already completed payment, our team will verify your UTR and issue your official offer letter shortly.<br>
                      • If you haven’t paid yet, you can complete payment later by visiting our registration portal.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="font-size:14px;line-height:1.6;color:#64748b;margin:0 0 24px 0;">
                If you have any questions in the meantime, reply directly to this email or reach us at <a href="mailto:dakhedusolution@gmail.com" style="color:#7c3aed;text-decoration:none;">dakhedusolution@gmail.com</a>.
              </p>

              <p style="font-size:14px;line-height:1.6;color:#334155;margin:0;">
                Best regards,<br>
                <strong>The DAKH EDU SOLUTIONS Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;padding:20px;text-align:center;border-top:1px solid #e2e8f0;font-size:12px;color:#94a3b8;">
              © ${new Date().getFullYear()} DAKH EDU SOLUTIONS. All rights reserved.<br>
              Chennai, Tamil Nadu, India | <a href="https://dakhedusolutions.in" style="color:#7c3aed;text-decoration:none;">dakhedusolutions.in</a>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Stage 2: Payment Approval & Offer Letter Dispatch with Student Credentials
 * Matches exact wording requested:
 * "Dear Student, Your payment has been verified, and your internship registration with DAKH EDU SOLUTIONS has been approved..."
 */
export function getPaymentApprovalEmailHtml({
  fullName,
  domain,
  internNumber,
  loginEmail,
  password
}) {
  const displayLoginId = internNumber || loginEmail || 'Your Registered Email';
  const displayPassword = password || 'Provided during registration';
  const loginUrl = 'https://www.dakhedusolutions.in/student/login';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Approved & Official Offer Letter - DAKH EDU SOLUTIONS</title>
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f8fafc;padding:30px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 25px rgba(0,0,0,0.05);border:1px solid #e2e8f0;">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg, #10b981 0%, #047857 100%);padding:35px 30px;text-align:center;">
              <span style="background:rgba(255,255,255,0.2);color:#ffffff;font-size:11px;font-weight:700;padding:4px 12px;border-radius:20px;text-transform:uppercase;letter-spacing:1px;display:inline-block;margin-bottom:10px;">
                Payment Verified & Approved
              </span>
              <h1 style="color:#ffffff;font-size:22px;font-weight:800;letter-spacing:1px;margin:0 0 6px 0;text-transform:uppercase;">
                DAKH EDU SOLUTIONS
              </h1>
              <p style="color:#d1fae5;font-size:14px;font-weight:600;margin:0;">
                Official Internship Offer Letter & Credentials
              </p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding:35px 30px;">
              <p style="font-size:15px;line-height:1.6;color:#1e293b;margin:0 0 16px 0;">
                Dear ${fullName || 'Student'},
              </p>

              <p style="font-size:15px;line-height:1.6;color:#334155;margin:0 0 16px 0;">
                Your payment has been verified, and your internship registration with <strong>DAKH EDU SOLUTIONS</strong> has been approved.
              </p>

              <p style="font-size:15px;line-height:1.6;color:#334155;margin:0 0 24px 0;">
                Your official internship offer letter is attached to this email as a PDF. Please review it and keep a copy for your records.
              </p>

              <!-- Credentials Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-left:4px solid #7c3aed;border-radius:8px;padding:18px 20px;margin-bottom:24px;">
                <tr>
                  <td>
                    <h3 style="font-size:14px;font-weight:800;color:#0f172a;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 12px 0;">
                      Student Dashboard Login
                    </h3>
                    <p style="font-size:14px;line-height:1.9;color:#334155;margin:0;">
                      <strong>Login ID</strong> — <span style="font-family:monospace;font-weight:700;color:#7c3aed;font-size:15px;">${displayLoginId}</span><br>
                      ${loginEmail && internNumber && loginEmail !== internNumber ? `<strong>Registered Email</strong> — <span style="font-family:monospace;font-weight:600;color:#475569;">${loginEmail}</span><br>` : ''}
                      <strong>Password</strong> — <span style="font-family:monospace;font-weight:700;color:#0f172a;background:#ede9fe;padding:2px 8px;border-radius:4px;border:1px solid #ddd6fe;font-size:15px;">${displayPassword}</span>
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Login CTA Button & Direct Link -->
              <div style="text-align:center;margin:28px 0;">
                <a href="${loginUrl}" style="background:#7c3aed;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 32px;border-radius:10px;display:inline-block;box-shadow:0 4px 12px rgba(124,58,237,0.3);">
                  Log in to your Student Dashboard →
                </a>
                <div style="margin-top:14px;">
                  <a href="${loginUrl}" style="color:#7c3aed;text-decoration:underline;font-size:13px;font-weight:700;">
                    DAKH Edu Solutions | Learn. Build. Earn. (${loginUrl})
                  </a>
                </div>
              </div>

              <p style="font-size:14px;line-height:1.6;color:#475569;margin:0 0 24px 0;">
                You can find your internship schedule and onboarding instructions in the dashboard.
              </p>

              <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />

              <p style="font-size:14px;line-height:1.6;color:#334155;margin:0 0 16px 0;">
                Best regards,<br>
                <strong>Internship Coordination Team</strong><br>
                DAKH EDU SOLUTIONS
              </p>

              <p style="font-size:12px;color:#94a3b8;font-style:italic;margin:0;">
                This is an automated email. Please do not reply to this message.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;padding:20px;text-align:center;border-top:1px solid #e2e8f0;font-size:12px;color:#94a3b8;">
              © ${new Date().getFullYear()} DAKH EDU SOLUTIONS. All rights reserved.<br>
              Chennai, Tamil Nadu, India | <a href="https://dakhedusolutions.in" style="color:#7c3aed;text-decoration:none;">dakhedusolutions.in</a>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Stage 3: Project Submission Reminder (Sent 3 Days before Internship End)
 * Matches exact wording requested:
 * "Dear Intern, Your internship ends in three days. To receive your Internship Completion Certificate..."
 */
export function getProjectSubmissionReminderEmailHtml({
  fullName,
  internNumber,
  domain,
  endDate
}) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Internship Project Submission Reminder - DAKH EDU SOLUTIONS</title>
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f8fafc;padding:30px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 25px rgba(0,0,0,0.05);border:1px solid #e2e8f0;">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg, #f59e0b 0%, #d97706 100%);padding:35px 30px;text-align:center;">
              <span style="background:rgba(255,255,255,0.25);color:#ffffff;font-size:11px;font-weight:700;padding:4px 12px;border-radius:20px;text-transform:uppercase;letter-spacing:1px;display:inline-block;margin-bottom:10px;">
                Action Required • 3 Days Remaining
              </span>
              <h1 style="color:#ffffff;font-size:22px;font-weight:800;letter-spacing:1px;margin:0 0 6px 0;text-transform:uppercase;">
                DAKH EDU SOLUTIONS
              </h1>
              <p style="color:#fef3c7;font-size:14px;font-weight:600;margin:0;">
                Internship Project Submission Reminder
              </p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding:35px 30px;">
              <p style="font-size:15px;line-height:1.6;color:#1e293b;margin:0 0 16px 0;">
                Dear ${fullName || 'Intern'},
              </p>

              <p style="font-size:15px;line-height:1.6;color:#334155;margin:0 0 16px 0;">
                Your internship ends in three days${endDate ? ` (${endDate})` : ''}. To receive your <strong>Internship Completion Certificate</strong>, please email your project link to <a href="mailto:dakhedusolutions@gmail.com" style="color:#7c3aed;font-weight:700;text-decoration:none;">dakhedusolutions@gmail.com</a> by your internship end date.
              </p>

              <!-- Format Instructions Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#fffbeb;border:1px solid #fef3c7;border-left:4px solid #f59e0b;border-radius:8px;padding:18px 20px;margin-bottom:24px;">
                <tr>
                  <td>
                    <h3 style="font-size:14px;font-weight:800;color:#92400e;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 10px 0;">
                      Submission Instructions
                    </h3>
                    <p style="font-size:14px;line-height:1.7;color:#78350f;margin:0;">
                      • <strong>Subject Line:</strong> <span style="font-family:monospace;font-weight:700;color:#92400e;">Internship Project Submission – ${fullName || '[Your Full Name]'}</span><br>
                      • <strong>Include in Email Body:</strong><br>
                      &nbsp;&nbsp;1. Full Name: <strong>${fullName || ''}</strong><br>
                      &nbsp;&nbsp;2. Intern ID: <strong>${internNumber || ''}</strong><br>
                      &nbsp;&nbsp;3. Internship Domain: <strong>${domain || ''}</strong><br>
                      &nbsp;&nbsp;4. Project Link (GitHub / Drive / Live URL)
                    </p>
                  </td>
                </tr>
              </table>

              <p style="font-size:14px;line-height:1.6;color:#334155;margin:0 0 24px 0;">
                Before sending, please check that our team can open your project link without requesting access. We’ll review your submission before issuing your certificate.
              </p>

              <!-- Email Link Button -->
              <div style="text-align:center;margin:28px 0;">
                <a href="mailto:dakhedusolutions@gmail.com?subject=Internship%20Project%20Submission%20%E2%80%93%20${encodeURIComponent(fullName || 'Student')}&body=${encodeURIComponent(`Dear Team,\n\nPlease find my internship project submission details below:\n\nFull Name: ${fullName || ''}\nIntern ID: ${internNumber || ''}\nInternship Domain: ${domain || ''}\nProject Link: \n\nThank you,\n${fullName || ''}`)}" style="background:#d97706;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 32px;border-radius:10px;display:inline-block;box-shadow:0 4px 12px rgba(217,119,6,0.3);">
                  Submit Project via Email →
                </a>
              </div>

              <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />

              <p style="font-size:14px;line-height:1.6;color:#334155;margin:0 0 16px 0;">
                Best regards,<br>
                <strong>Internship Coordination Team</strong><br>
                DAKH EDU SOLUTIONS
              </p>

              <p style="font-size:12px;color:#94a3b8;font-style:italic;margin:0;">
                This is an automated reminder. Please send your project in a new email to <a href="mailto:dakhedusolutions@gmail.com" style="color:#7c3aed;text-decoration:none;">dakhedusolutions@gmail.com</a>.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;padding:20px;text-align:center;border-top:1px solid #e2e8f0;font-size:12px;color:#94a3b8;">
              © ${new Date().getFullYear()} DAKH EDU SOLUTIONS. All rights reserved.<br>
              Chennai, Tamil Nadu, India | <a href="https://dakhedusolutions.in" style="color:#7c3aed;text-decoration:none;">dakhedusolutions.in</a>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Stage 4: Certificate Delivery Dispatch
 * Matches exact wording requested:
 * "Dear Intern, Congratulations on completing your internship with DAKH EDU SOLUTIONS! Your Internship Completion Certificate has been issued..."
 */
export function getCertificateDeliveryEmailHtml({
  fullName,
  internNumber,
  domain,
  certificateLink
}) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Internship Completion Certificate - DAKH EDU SOLUTIONS</title>
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f8fafc;padding:30px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 25px rgba(0,0,0,0.05);border:1px solid #e2e8f0;">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg, #7c3aed 0%, #4338ca 100%);padding:35px 30px;text-align:center;">
              <span style="background:rgba(255,255,255,0.2);color:#ffffff;font-size:11px;font-weight:700;padding:4px 12px;border-radius:20px;text-transform:uppercase;letter-spacing:1px;display:inline-block;margin-bottom:10px;">
                Verified Credential Issued
              </span>
              <h1 style="color:#ffffff;font-size:22px;font-weight:800;letter-spacing:1px;margin:0 0 6px 0;text-transform:uppercase;">
                DAKH EDU SOLUTIONS
              </h1>
              <p style="color:#e0e7ff;font-size:14px;font-weight:600;margin:0;">
                Internship Completion Certificate
              </p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding:35px 30px;">
              <p style="font-size:15px;line-height:1.6;color:#1e293b;margin:0 0 16px 0;">
                Dear ${fullName || 'Intern'},
              </p>

              <p style="font-size:15px;line-height:1.6;color:#334155;margin:0 0 16px 0;">
                Congratulations on completing your internship with <strong>DAKH EDU SOLUTIONS</strong>!
              </p>

              <p style="font-size:15px;line-height:1.6;color:#334155;margin:0 0 20px 0;">
                Your <strong>Internship Completion Certificate</strong> has been issued and is attached to this email as a PDF.
              </p>

              ${certificateLink ? `
              <!-- Certificate Online Link -->
              <div style="text-align:center;margin:28px 0;">
                <a href="${certificateLink}" style="background:#7c3aed;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 32px;border-radius:10px;display:inline-block;box-shadow:0 4px 12px rgba(124,58,237,0.3);">
                  View & Download Verified Certificate Online →
                </a>
              </div>
              ` : ''}

              <p style="font-size:14px;line-height:1.6;color:#475569;margin:0 0 20px 0;">
                If you have trouble opening the attachment or need a correction, please contact us at <a href="mailto:dakhedusolutions@gmail.com" style="color:#7c3aed;text-decoration:none;font-weight:600;">dakhedusolutions@gmail.com</a>.
              </p>

              <p style="font-size:15px;line-height:1.6;color:#334155;margin:0 0 24px 0;">
                Thank you for being part of our internship program. We wish you all the best in your future endeavours!
              </p>

              <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />

              <p style="font-size:14px;line-height:1.6;color:#334155;margin:0 0 16px 0;">
                Best regards,<br>
                <strong>Internship Coordination Team</strong><br>
                DAKH EDU SOLUTIONS
              </p>

              <p style="font-size:12px;color:#94a3b8;font-style:italic;margin:0;">
                This is an automated email. Please do not reply directly.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;padding:20px;text-align:center;border-top:1px solid #e2e8f0;font-size:12px;color:#94a3b8;">
              © ${new Date().getFullYear()} DAKH EDU SOLUTIONS. All rights reserved.<br>
              Chennai, Tamil Nadu, India | <a href="https://dakhedusolutions.in" style="color:#7c3aed;text-decoration:none;">dakhedusolutions.in</a>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
