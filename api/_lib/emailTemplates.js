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
                    <h3 style="font-size:15px;font-weight:700;color:#0f172a;margin:0 0 12px 0;">
                      What happens next?
                    </h3>
                    <p style="margin:0 0 10px 0;color:#334155;font-size:14px;line-height:1.6;">
                      If you’ve already paid, our team will verify your payment details. If you haven’t paid yet, you can complete your payment and submit your transaction reference when you’re ready.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="font-size:15px;line-height:1.6;color:#334155;margin:0 0 20px 0;">
                Once your payment is verified and your registration is approved, we’ll email your <strong>official offer letter, secure student portal access link, and onboarding instructions</strong>.
              </p>

              <p style="font-size:15px;line-height:1.6;color:#334155;margin:0 0 24px 0;">
                We look forward to welcoming you to the program.
              </p>

              <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />

              <p style="font-size:14px;color:#475569;line-height:1.6;margin:0;">
                Best regards,<br>
                Internship Coordination Team<br>
                <strong>DAKH EDU SOLUTIONS</strong><br>
                <a href="https://dakhedusolutions.in" style="color:#7c3aed;text-decoration:none;">https://dakhedusolutions.in</a>
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
 * Stage 2: Payment Approval & Offer Letter Dispatch
 */
export function getPaymentApprovalEmailHtml({
  fullName,
  domain,
  internNumber,
  activationUrl,
  loginEmail
}) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Approved - Internship Offer Letter</title>
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
              <h1 style="color:#ffffff;font-size:24px;font-weight:800;letter-spacing:1px;margin:0 0 6px 0;text-transform:uppercase;">
                Welcome to DAKH EDU SOLUTIONS
              </h1>
              <p style="color:#d1fae5;font-size:14px;font-weight:600;margin:0;">
                Official Internship Offer Letter Attached
              </p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding:35px 30px;">
              <h2 style="font-size:20px;font-weight:700;color:#0f172a;margin:0 0 16px 0;">
                Congratulations, ${fullName}! 🚀
              </h2>

              <p style="font-size:15px;line-height:1.6;color:#334155;margin:0 0 20px 0;">
                Your internship registration payment has been verified and approved. We are thrilled to formally welcome you to the <strong>${domain}</strong> internship cohort at <strong>DAKH EDU SOLUTIONS</strong>!
              </p>

              <!-- Approved Details -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px;margin-bottom:24px;">
                <tr>
                  <td>
                    <table width="100%" cellspacing="0" cellpadding="4" style="font-size:14px;color:#1e293b;">
                      <tr>
                        <td style="color:#15803d;width:40%;">Intern ID:</td>
                        <td style="font-family:monospace;font-weight:700;color:#047857;">${internNumber}</td>
                      </tr>
                      <tr>
                        <td style="color:#15803d;">Selected Domain:</td>
                        <td style="font-weight:600;">${domain}</td>
                      </tr>
                      <tr>
                        <td style="color:#15803d;">Registered Email:</td>
                        <td style="font-weight:600;">${loginEmail}</td>
                      </tr>
                      <tr>
                        <td style="color:#15803d;">Offer Letter:</td>
                        <td style="font-weight:700;color:#1e293b;">Attached to this email (PDF)</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Secure Portal Activation Button -->
              ${activationUrl ? `
              <div style="text-align:center;margin:30px 0;">
                <a href="${activationUrl}" style="background:#7c3aed;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 32px;border-radius:10px;display:inline-block;box-shadow:0 4px 12px rgba(124,58,237,0.3);">
                  Activate Student Portal Access →
                </a>
                <p style="font-size:12px;color:#94a3b8;margin:10px 0 0 0;">
                  This secure 1-click link logs you in safely and allows you to set your private password.
                </p>
              </div>
              ` : `
              <div style="text-align:center;margin:30px 0;">
                <a href="https://dakhedusolutions.in/student/login" style="background:#7c3aed;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 32px;border-radius:10px;display:inline-block;box-shadow:0 4px 12px rgba(124,58,237,0.3);">
                  Go to Student Portal Login →
                </a>
              </div>
              `}

              <!-- Next Steps -->
              <h3 style="font-size:14px;font-weight:700;color:#0f172a;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 10px 0;">
                What to do next:
              </h3>
              <ol style="font-size:14px;line-height:1.7;color:#475569;margin:0 0 24px 0;padding-left:20px;">
                <li>Download and review your official <strong>Internship Offer Letter</strong> attached as a PDF.</li>
                <li>Activate your portal access using the button above to view learning modules and roadmap tasks.</li>
                <li>Stay active on our official announcements channel for orientation meeting dates and timings.</li>
              </ol>

              <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />

              <p style="font-size:13px;color:#94a3b8;line-height:1.5;margin:0;">
                Congratulations once again!<br>
                <strong>Admissions & Mentorship Board</strong><br>
                DAKH EDU SOLUTIONS
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
