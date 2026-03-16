/**
 * Email utility — nodemailer wrapper for OTP sending and form submission notifications.
 * Reads SMTP configuration from the system_settings database table.
 */

import nodemailer from "nodemailer";
import prisma from "@/lib/prisma";

/** Fetch all email-related settings from system_settings table as a key-value map */
export async function getEmailConfig(): Promise<Record<string, string>> {
  const rows = await prisma.systemSettings.findMany({
    where: {
      key: {
        in: [
          "smtp_host",
          "smtp_port",
          "smtp_user",
          "smtp_pass",
          "smtp_from",
          "smtp_secure",
          "admin_email",
        ],
      },
    },
  });
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

/** Create a nodemailer transporter from stored SMTP config */
export async function createTransporter() {
  const cfg = await getEmailConfig();
  if (!cfg.smtp_host || !cfg.smtp_user || !cfg.smtp_pass) {
    throw new Error(
      "Email not configured. Set SMTP settings in Admin → Settings → Email."
    );
  }
  return nodemailer.createTransport({
    host: cfg.smtp_host,
    port: parseInt(cfg.smtp_port || "587", 10),
    secure: cfg.smtp_secure === "true",
    auth: { user: cfg.smtp_user, pass: cfg.smtp_pass },
  });
}

/**
 * Send a 6-digit OTP verification email to the user.
 * Called when a user submits a CTA form or form page — before the submission is processed.
 */
export async function sendOtpEmail(
  toEmail: string,
  otp: string,
  cfg: Record<string, string>
) {
  const transporter = await createTransporter();
  await transporter.sendMail({
    from: cfg.smtp_from || cfg.smtp_user,
    to: toEmail,
    subject: "Your verification code",
    html: `
      <div style="font-family:sans-serif;max-width:400px;margin:0 auto;padding:24px;border:1px solid #e5e7eb;border-radius:8px">
        <h2 style="color:#1e40af;margin-top:0">Verify your email</h2>
        <p style="color:#374151">Use this code to complete your submission:</p>
        <div style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#1e40af;padding:16px;background:#eff6ff;border-radius:8px;text-align:center;margin:16px 0">
          ${otp}
        </div>
        <p style="color:#6b7280;font-size:14px;margin-bottom:0">
          This code expires in <strong>10 minutes</strong>. Do not share it with anyone.
        </p>
      </div>
    `,
  });
}

/**
 * Send a form submission notification email to the admin.
 * Called after OTP verification succeeds — forwards the submitted form data.
 */
export async function sendSubmissionEmail(
  fields: Array<{ label: string; value: string }>,
  userEmail: string,
  cfg: Record<string, string>,
  source: string,
  emailTo?: string
) {
  const recipient = emailTo || cfg.admin_email;
  if (!recipient) return; // No destination configured — skip silently
  const transporter = await createTransporter();
  const rows = fields
    .map(
      (f) =>
        `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-weight:600;color:#374151;white-space:nowrap">${f.label}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#111827">${f.value}</td>
        </tr>`
    )
    .join("");

  await transporter.sendMail({
    from: cfg.smtp_from || cfg.smtp_user,
    to: recipient,
    replyTo: userEmail,
    subject: `New enquiry from ${userEmail} — ${source}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;border:1px solid #e5e7eb;border-radius:8px">
        <h2 style="color:#1e40af;margin-top:0">New Website Enquiry</h2>
        <p style="color:#6b7280;margin-top:0">Source: <strong style="color:#374151">${source}</strong></p>
        <table style="width:100%;border-collapse:collapse;margin-top:16px">
          ${rows}
        </table>
        <p style="margin-top:24px;font-size:12px;color:#9ca3af;border-top:1px solid #e5e7eb;padding-top:16px">
          Reply directly to this email to respond to ${userEmail}
        </p>
      </div>
    `,
  });
}
