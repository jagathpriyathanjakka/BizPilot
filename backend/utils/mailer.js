const nodemailer = require('nodemailer');

let transporter = null;

async function getTransporter() {
  if (transporter) return transporter;

  // Check if real SMTP credentials are provided in env
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      return transporter;
    } catch (e) {
      console.warn('[BizPilot Mailer] Failed to initialize SMTP transporter:', e.message);
    }
  }

  // Fallback to offline/json transporter (0 network calls, 0 timeout, 100% reliable)
  transporter = nodemailer.createTransport({
    jsonTransport: true,
  });

  return transporter;
}

async function sendVerificationEmail({ to, code, name }) {
  const from = process.env.FROM_EMAIL || '"BizPilot AI" <no-reply@bizpilot.ai>';
  const subject = `Your BizPilot AI Verification Code: ${code}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #070B14; color: #e2e8f0; margin: 0; padding: 24px; }
        .card { max-width: 500px; margin: 0 auto; background: #0B1120; border: 1px solid #1e293b; border-radius: 16px; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
        .logo { font-size: 20px; font-weight: bold; color: #38bdf8; letter-spacing: -0.5px; margin-bottom: 24px; }
        .code-box { background: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }
        .code { font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #a78bfa; font-family: monospace; }
        .footer { font-size: 11px; color: #64748b; margin-top: 32px; text-align: center; border-top: 1px solid #1e293b; padding-top: 16px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="logo">⚡ BizPilot AI</div>
        <h2>Verify your email address</h2>
        <p>Hello ${name || 'Business Owner'},</p>
        <p>Thank you for registering with BizPilot AI. Use the 6-digit verification code below to verify your account and activate your business workspace:</p>
        <div class="code-box">
          <div class="code">${code}</div>
        </div>
        <p style="font-size: 13px; color: #94a3b8;">This code will expire in 24 hours. If you did not request this verification, please disregard this email.</p>
        <div class="footer">
          &copy; ${new Date().getFullYear()} BizPilot AI Platforms. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;

  console.log(`\n========================================================`);
  console.log(`[BizPilot Mailer] VERIFICATION CODE SENT`);
  console.log(`To: ${to}`);
  console.log(`Code: ${code}`);
  console.log(`Time: ${new Date().toISOString()}`);
  console.log(`========================================================\n`);

  try {
    const mailer = await getTransporter();
    const info = await mailer.sendMail({
      from,
      to,
      subject,
      text: `Your BizPilot AI verification code is: ${code}. It expires in 24 hours.`,
      html,
    });

    const previewUrl = nodemailer.getTestMessageUrl ? nodemailer.getTestMessageUrl(info) : null;
    if (previewUrl) {
      console.log(`[BizPilot Mailer] Ethereal Email Preview URL: ${previewUrl}`);
    }
    return { success: true, messageId: info.messageId, previewUrl };
  } catch (err) {
    console.error('[BizPilot Mailer] Failed to send email via transporter:', err.message);
    return { success: false, error: err.message };
  }
}

module.exports = { sendVerificationEmail };
