import nodemailer from 'nodemailer';

let cachedTransporter = null;

function isSmtpConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function getTransporter() {
  if (!isSmtpConfigured()) return null;
  if (!cachedTransporter) {
    cachedTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }
  return cachedTransporter;
}

/**
 * Send a transactional email via configured SMTP, or log cleanly in local preview mode.
 */
export async function sendEmail({ to, subject, html, text }) {
  const from = process.env.SMTP_FROM || 'AURA JEWELS Studio <hello@aurajewels.in>';
  const transporter = getTransporter();

  if (!transporter) {
    console.info(`[Mailer Preview] To: ${to} | Subject: ${subject}`);
    return { sent: false, previewMode: true };
  }

  try {
    const info = await transporter.sendMail({ from, to, subject, html, text });
    return { sent: true, messageId: info.messageId };
  } catch (err) {
    console.error('[Mailer Error]:', err.message);
    return { sent: false, error: err.message };
  }
}
