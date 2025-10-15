import { NextRequest, NextResponse } from "next/server";

// Simple email sending function (can be replaced with actual email service)
async function sendEmail(
  to: string[],
  subject: string,
  html: string,
  text: string
) {
  // For now, just log the email content
  // In production, integrate with services like SendGrid, AWS SES, or Nodemailer
  console.log("=== CRITICAL ERROR EMAIL ===");
  console.log("To:", to.join(", "));
  console.log("Subject:", subject);
  console.log("HTML Content:", html);
  console.log("Text Content:", text);
  console.log("============================");

  // TODO: Implement actual email sending
  // Example with fetch to email service:
  /*
  const response = await fetch('https://api.sendgrid.v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: to.map(email => ({ email })) }],
      from: { email: process.env.FROM_EMAIL },
      subject,
      content: [
        { type: 'text/html', value: html },
        { type: 'text/plain', value: text }
      ]
    })
  });
  */

  return Promise.resolve(true);
}

export async function POST(request: NextRequest) {
  try {
    const alertData = await request.json();

    const { error, context, sessionURL, timestamp } = alertData;

    // Generate alert email content
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #dc2626; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">🚨 Critical Error Alert</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Andrino Academy Platform</p>
        </div>
        
        <div style="background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb;">
          <h2 style="color: #111827; margin-top: 0;">Error Details</h2>
          
          <div style="background: white; padding: 15px; border-radius: 6px; margin-bottom: 15px;">
            <h3 style="color: #dc2626; margin-top: 0;">Error Message</h3>
            <p style="font-family: monospace; background: #fee2e2; padding: 10px; border-radius: 4px;">
              ${error.message}
            </p>
          </div>

          <div style="background: white; padding: 15px; border-radius: 6px; margin-bottom: 15px;">
            <h3 style="color: #374151; margin-top: 0;">Context Information</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Timestamp:</td>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${new Date(
                  timestamp
                ).toLocaleString("ar-SA")}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">User ID:</td>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${
                  context.userId || "Unknown"
                }</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">User Role:</td>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${
                  context.userRole || "Unknown"
                }</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Page:</td>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${
                  context.page || context.url || "Unknown"
                }</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Action:</td>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${
                  context.action || "Unknown"
                }</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Environment:</td>
                <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${
                  context.environment || "Unknown"
                }</td>
              </tr>
            </table>
          </div>

          ${
            sessionURL
              ? `
          <div style="background: white; padding: 15px; border-radius: 6px; margin-bottom: 15px;">
            <h3 style="color: #374151; margin-top: 0;">Session Recording</h3>
            <a href="${sessionURL}" 
               style="display: inline-block; background: #3b82f6; color: white; padding: 10px 15px; text-decoration: none; border-radius: 6px;">
              View Session Recording
            </a>
          </div>
          `
              : ""
          }

          ${
            error.stack
              ? `
          <div style="background: white; padding: 15px; border-radius: 6px;">
            <h3 style="color: #374151; margin-top: 0;">Stack Trace</h3>
            <pre style="background: #f3f4f6; padding: 10px; border-radius: 4px; overflow-x: auto; font-size: 12px; color: #374151;">
${error.stack}
            </pre>
          </div>
          `
              : ""
          }
        </div>
        
        <div style="background: #374151; color: white; padding: 15px; border-radius: 0 0 8px 8px; text-align: center;">
          <p style="margin: 0; font-size: 14px;">
            This is an automated alert from Andrino Academy error monitoring system.
          </p>
        </div>
      </div>
    `;

    // Send email to administrators
    const adminEmails = process.env.ADMIN_EMAILS?.split(",") || [];

    if (adminEmails.length === 0) {
      console.warn("No admin emails configured for critical error alerts");
      return NextResponse.json({
        success: false,
        error: "No admin emails configured",
      });
    }

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: adminEmails,
      subject: `🚨 Critical Error - Andrino Academy [${context.environment?.toUpperCase()}]`,
      html: emailHtml,
      text: `
Critical Error Alert - Andrino Academy

Error: ${error.message}
Timestamp: ${new Date(timestamp).toLocaleString("ar-SA")}
User: ${context.userId || "Unknown"} (${context.userRole || "Unknown"})
Page: ${context.page || context.url || "Unknown"}
Action: ${context.action || "Unknown"}
Environment: ${context.environment || "Unknown"}

${sessionURL ? `Session Recording: ${sessionURL}` : ""}

Stack Trace:
${error.stack || "Not available"}
      `,
    };

    // Send the email
    await sendEmail(
      adminEmails,
      mailOptions.subject,
      emailHtml,
      mailOptions.text
    );

    // Log the alert sending
    console.log(
      `Critical error alert sent to ${adminEmails.length} administrators`,
      {
        error: error.message,
        context,
        timestamp,
      }
    );

    return NextResponse.json({
      success: true,
      message: "Critical error alert sent successfully",
      recipients: adminEmails.length,
    });
  } catch (alertError) {
    console.error("Failed to send critical error alert:", alertError);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to send alert",
        details:
          alertError instanceof Error ? alertError.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Handle preflight requests
export async function OPTIONS() {
  return NextResponse.json({ success: true });
}
