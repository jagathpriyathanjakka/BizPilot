const nodemailer = require('nodemailer');

/**
 * Parses and returns active email / SMTP configuration from environment variables.
 * Supports:
 * 1. Gmail SMTP (GMAIL_USER + GMAIL_APP_PASSWORD)
 * 2. Resend API (RESEND_API_KEY)
 * 3. Standard Custom SMTP (SMTP_HOST + SMTP_USER + SMTP_PASS)
 */
function getEmailConfig() {
  const gmailUser = (process.env.GMAIL_USER || process.env.EMAIL_USER || '').trim();
  const gmailPass = (process.env.GMAIL_APP_PASSWORD || process.env.GMAIL_PASS || process.env.EMAIL_PASS || '').replace(/\s+/g, '');

  if (gmailUser && gmailPass) {
    return {
      type: 'gmail',
      user: gmailUser,
      pass: gmailPass,
    };
  }

  const resendApiKey = (process.env.RESEND_API_KEY || '').trim();
  if (resendApiKey) {
    return {
      type: 'resend',
      apiKey: resendApiKey,
      user: process.env.FROM_EMAIL || 'BizPilot AI <onboarding@resend.dev>',
    };
  }

  const smtpHost = (process.env.SMTP_HOST || '').trim();
  const smtpPort = Number(process.env.SMTP_PORT) || 587;
  const smtpUser = (process.env.SMTP_USER || '').trim();
  const smtpPass = (process.env.SMTP_PASS || '').replace(/\s+/g, '');

  if (smtpHost && smtpUser && smtpPass) {
    return {
      type: 'smtp',
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465 || process.env.SMTP_SECURE === 'true',
      user: smtpUser,
      pass: smtpPass,
    };
  }

  return null;
}

let cachedTransporter = null;
let lastConfigKey = null;

function getTransporter(config) {
  if (!config) {
    // Fallback to offline / mock transporter (when no SMTP credentials are configured)
    return nodemailer.createTransport({
      jsonTransport: true,
    });
  }

  const key = `${config.type}:${config.user}:${config.host || ''}:${config.port || ''}`;
  if (cachedTransporter && lastConfigKey === key) {
    return cachedTransporter;
  }

  if (config.type === 'gmail') {
    cachedTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });
  } else {
    cachedTransporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass,
      },
      tls: {
        rejectUnauthorized: process.env.NODE_ENV === 'production' && !process.env.SMTP_IGNORE_TLS,
      },
    });
  }

  lastConfigKey = key;
  return cachedTransporter;
}

/**
 * Dispatches an authentic 6-digit verification code to the target email.
 * If credentials are configured in .env, it delivers a real email to the recipient's Gmail inbox.
 */
async function sendVerificationEmail({ to, code, name }) {
  const config = getEmailConfig();
  const isConfigured = Boolean(config);
  
  // Gmail requires the 'from' email to match the authenticated Gmail account
  const senderAddress = config?.user || 'no-reply@bizpilot.ai';
  const from = process.env.FROM_EMAIL || `"BizPilot AI" <${senderAddress}>`;
  const subject = `Your BizPilot AI Verification Code: ${code}`;
  
  const text = `Hello ${name || 'Business Owner'},\n\n` +
    `Your BizPilot AI 6-digit confirmation code is: ${code}\n\n` +
    `Enter this code to verify your email address and activate your business workspace.\n` +
    `This code will expire in 24 hours.\n\n` +
    `Best regards,\nBizPilot AI Team`;

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
        .code { font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #a78bfa; font-family: monospace; }
        .instruction { font-size: 14px; line-height: 1.6; color: #cbd5e1; }
        .footer { font-size: 11px; color: #64748b; margin-top: 32px; text-align: center; border-top: 1px solid #1e293b; padding-top: 16px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="logo">⚡ BizPilot AI</div>
        <h2>Verify your email address</h2>
        <p class="instruction">Hello <strong>${name || 'Business Owner'}</strong>,</p>
        <p class="instruction">Thank you for accessing BizPilot AI. Use the 6-digit confirmation code below to verify your account and activate your business workspace:</p>
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
  console.log(`[BizPilot Mailer] VERIFICATION CODE DISPATCH`);
  console.log(`To: ${to}`);
  console.log(`Code: ${code}`);
  console.log(`Delivery Mode: ${isConfigured ? `REAL (${config.type.toUpperCase()}: ${config.user})` : 'SANDBOX SIMULATED (No email provider configured in .env)'}`);
  console.log(`Time: ${new Date().toISOString()}`);
  console.log(`========================================================\n`);

  if (!isConfigured) {
    return {
      success: true,
      isRealDelivery: false,
      message: 'SMTP credentials not configured. Using instant local OTP display.',
      code,
    };
  }

  // Handle Resend REST API if configured
  if (config.type === 'resend') {
    try {
      const resp = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from,
          to: [to],
          subject,
          text,
          html,
        }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.message || JSON.stringify(data));
      }
      console.log(`[BizPilot Mailer] ✅ Email delivered via Resend API to ${to} (ID: ${data.id})`);
      return {
        success: true,
        isRealDelivery: true,
        messageId: data.id,
        code,
      };
    } catch (err) {
      console.error(`[BizPilot Mailer] ❌ Resend API delivery failed:`, err.message);
      return {
        success: false,
        isRealDelivery: false,
        error: err.message,
        code,
      };
    }
  }

  // Handle Nodemailer (Gmail or Custom SMTP)
  const mailer = getTransporter(config);

  try {
    const info = await mailer.sendMail({
      from,
      to,
      subject,
      text,
      html,
    });

    console.log(`[BizPilot Mailer] ✅ Email successfully delivered to ${to} (MessageId: ${info.messageId})`);
    return {
      success: true,
      isRealDelivery: true,
      messageId: info.messageId,
      code,
    };
  } catch (err) {
    console.error(`[BizPilot Mailer] ❌ SMTP delivery failed:`, err.message);
    return {
      success: false,
      isRealDelivery: false,
      error: err.message,
      code,
    };
  }
}

module.exports = {
  sendVerificationEmail,
  getEmailConfig,
};
