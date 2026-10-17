import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

export const COMPANY_EMAIL = 'intellicaautomationgroup@gmail.com';
export const COMPANY_NAME = 'Intellica Automation Group';

export interface SendMailOptions {
  to: string;
  toName?: string;
  subject: string;
  text: string;
  html?: string;
  tempPassword?: string;
}

export interface SendMailResult {
  success: boolean;
  simulated: boolean;
  messageId?: string;
  error?: string;
  infoMessage?: string;
}

/**
 * Retrieves Gmail / SMTP credentials from environment variables or active .env file
 */
export function getMailerCredentials() {
  let user = process.env.GMAIL_USER || process.env.SMTP_USER || COMPANY_EMAIL;
  let pass = process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS || process.env.EMAIL_PASSWORD;

  // If not yet present in process.env, check .env file directly (handles runtime addition of credentials)
  if (!pass) {
    try {
      const envPath = path.resolve(process.cwd(), '.env');
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        const passMatch = envContent.match(/^GMAIL_APP_PASSWORD=["']?([^"'\r\n]+)["']?/m) 
          || envContent.match(/^SMTP_PASS=["']?([^"'\r\n]+)["']?/m)
          || envContent.match(/^EMAIL_PASSWORD=["']?([^"'\r\n]+)["']?/m);
        if (passMatch && passMatch[1]) {
          pass = passMatch[1].trim();
        }
        const userMatch = envContent.match(/^GMAIL_USER=["']?([^"'\r\n]+)["']?/m)
          || envContent.match(/^SMTP_USER=["']?([^"'\r\n]+)["']?/m);
        if (userMatch && userMatch[1]) {
          user = userMatch[1].trim();
        }
      }
    } catch (e) {
      // ignore
    }
  }

  return {
    user: user || COMPANY_EMAIL,
    pass: pass ? pass.trim().replace(/\s+/g, '') : null
  };
}

/**
 * Checks current mailer configuration status
 */
export function checkMailerStatus() {
  const { user, pass } = getMailerCredentials();
  return {
    configured: !!pass,
    senderEmail: COMPANY_EMAIL,
    authAccount: user,
    deliveryMode: pass ? 'live_smtp' : 'simulation_pending_credentials',
    instructions: pass
      ? `Live SMTP transmission enabled from ${COMPANY_EMAIL}.`
      : `To transmit real emails directly to internet inboxes from ${COMPANY_EMAIL}, configure GMAIL_APP_PASSWORD in your .env file with a 16-character Google App Password from https://myaccount.google.com/apppasswords.`
  };
}

/**
 * Creates the nodemailer transporter using Gmail SMTP
 */
function createTransporter() {
  const { user, pass } = getMailerCredentials();

  if (!pass) {
    return null;
  }

  // Custom SMTP configuration if supplied
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST.trim(),
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true' || Number(process.env.SMTP_PORT) === 465,
      auth: {
        user,
        pass
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  // Gmail SMTP transporter with direct SSL on port 465
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user,
      pass
    },
    tls: {
      rejectUnauthorized: false
    }
  });
}

/**
 * Builds standard branded HTML email
 */
function buildBrandedHtml(title: string, bodyText: string, otpOrPassword?: string): string {
  const formattedBody = bodyText
    .split('\n\n')
    .map(p => `<p style="margin: 0 0 14px 0; line-height: 1.6; color: #334155;">${p.replace(/\n/g, '<br/>')}</p>`)
    .join('');

  const codeBox = otpOrPassword
    ? `
    <div style="background-color: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 8px; padding: 16px; margin: 20px 0; text-align: center;">
      <span style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em; display: block; margin-bottom: 6px;">
        Verification Credential / Code
      </span>
      <span style="font-family: monospace; font-size: 26px; font-weight: 700; color: #0f172a; letter-spacing: 0.25em;">
        ${otpOrPassword}
      </span>
    </div>`
    : '';

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #0f172a;">
    <div style="max-width: 580px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
      
      <!-- Brand Header -->
      <div style="background-color: #0f172a; padding: 22px 28px; border-bottom: 3px solid #10b981;">
        <h1 style="margin: 0; font-size: 18px; font-weight: 700; color: #ffffff; letter-spacing: 0.03em;">
          STEM-SPARK-LAB KENYA
        </h1>
        <p style="margin: 4px 0 0 0; font-size: 12px; color: #94a3b8;">
          Powered by ${COMPANY_NAME}
        </p>
      </div>

      <!-- Main Body -->
      <div style="padding: 28px;">
        <h2 style="margin: 0 0 16px 0; font-size: 17px; font-weight: 600; color: #0f172a;">
          ${title}
        </h2>

        ${formattedBody}

        ${codeBox}
      </div>

      <!-- Footer -->
      <div style="background-color: #f8fafc; padding: 18px 28px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b; line-height: 1.5;">
        <p style="margin: 0 0 6px 0;">
          <strong>Sent from:</strong> ${COMPANY_NAME} &lt;<a href="mailto:${COMPANY_EMAIL}" style="color: #0284c7; text-decoration: none;">${COMPANY_EMAIL}</a>&gt;
        </p>
        <p style="margin: 0 0 6px 0;">
          Science & Technology Park, Nairobi, Kenya • Official STEM Practical Laboratory Support
        </p>
        <p style="margin: 0; color: #94a3b8;">
          © ${new Date().getFullYear()} ${COMPANY_NAME}. All rights reserved.
        </p>
      </div>

    </div>
  </body>
  </html>`;
}

/**
 * Sends an email from intellicaautomationgroup@gmail.com
 */
export async function sendEmail(options: SendMailOptions): Promise<SendMailResult> {
  const { to, toName, subject, text, tempPassword } = options;
  const recipient = toName ? `"${toName}" <${to}>` : to;
  const fromAddress = `"${COMPANY_NAME}" <${COMPANY_EMAIL}>`;

  const html = options.html || buildBrandedHtml(subject, text, tempPassword);

  const transporter = createTransporter();

  if (!transporter) {
    console.info(`\n======================================================`);
    console.info(`[MAILER] 📧 Outgoing Email Prepared:`);
    console.info(`  FROM:    ${fromAddress}`);
    console.info(`  TO:      ${recipient}`);
    console.info(`  SUBJECT: ${subject}`);
    if (tempPassword) {
      console.info(`  OTP/CREDENTIAL: ${process.env.NODE_ENV === 'production' || process.env.VERCEL ? '[hidden in production]' : tempPassword}`);
    }
    console.info(`  NOTE: Live SMTP transmission requires GMAIL_APP_PASSWORD in .env.`);
    console.info(`  Get 16-character Google App Password at: https://myaccount.google.com/apppasswords`);
    console.info(`======================================================\n`);

    return {
      success: true,
      simulated: true,
      infoMessage: `Email queued from ${COMPANY_EMAIL}. (To deliver live internet emails to inboxes, add GMAIL_APP_PASSWORD to your .env)`
    };
  }

  try {
    const info = await transporter.sendMail({
      from: fromAddress,
      to: recipient,
      replyTo: COMPANY_EMAIL,
      envelope: {
        from: COMPANY_EMAIL,
        to: [to]
      },
      subject,
      text,
      html
    });

    console.info(`[MAILER] ✅ Real email delivered to ${to} via Gmail SMTP (Message ID: ${info.messageId})`);
    return {
      success: true,
      simulated: false,
      messageId: info.messageId,
      infoMessage: `Email sent to ${to} from ${COMPANY_EMAIL}`
    };
  } catch (err: any) {
    const rawMsg = err.message || '';
    console.error(`[MAILER] ❌ Error sending email to ${to} via SMTP:`, rawMsg);

    let friendlyError = `Failed to deliver email via Gmail SMTP: ${rawMsg}`;

    if (
      rawMsg.includes('534-5.7.9') ||
      rawMsg.includes('Application-specific password required') ||
      rawMsg.includes('Invalid login') ||
      err.code === 'EAUTH'
    ) {
      friendlyError = `Google rejected the SMTP login (error 534-5.7.9): An Application-specific password is required for ${COMPANY_EMAIL}. Normal Google account passwords cannot be used for third-party email transmission. Please generate a 16-character App Password at https://myaccount.google.com/apppasswords (with 2-Step Verification ON) and set it in your .env file as GMAIL_APP_PASSWORD.`;
    }

    return {
      success: false,
      simulated: false,
      error: friendlyError
    };
  }
}
