const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('[email] SMTP credentials not set, emails will be logged only');
    return null;
  }
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  return transporter;
}

async function sendEmail({ to, subject, html }) {
  const t = getTransporter();
  if (!t) {
    console.log(`[email:skipped] To: ${to} | Subject: ${subject}`);
    return { skipped: true };
  }
  try {
    const info = await t.sendMail({
      from: process.env.EMAIL_FROM || 'FlatMatch <no-reply@flatmatch.app>',
      to,
      subject,
      html,
    });
    return info;
  } catch (err) {
    // Email failures must never break the request flow that triggered them
    console.error(`[email:error] ${err.message}`);
    return { error: err.message };
  }
}

const templates = {
  otpVerification: (name, otp) => ({
    subject: `${otp} is your FlatMatch verification code`,
    html: `<p>Hi ${name},</p>
      <p>Your FlatMatch verification code is:</p>
      <p style="font-size:28px;font-weight:700;letter-spacing:4px;margin:16px 0;">${otp}</p>
      <p>This code expires in ${process.env.OTP_EXPIRY_MINUTES || 10} minutes. If you didn't request this, you can ignore this email.</p>`,
  }),
  interestReceived: (ownerName, tenantName, listingTitle, score) => ({
    subject: `New interest in "${listingTitle}"`,
    html: `<p>Hi ${ownerName},</p>
      <p><strong>${tenantName}</strong> has expressed interest in your listing <strong>${listingTitle}</strong>${
      score != null ? ` with a compatibility score of <strong>${score}%</strong>` : ''
    }.</p>
      <p>Log in to FlatMatch to review and respond.</p>`,
  }),
  highMatchInterest: (ownerName, tenantName, listingTitle, score) => ({
    subject: `🔥 High-match tenant (${score}%) interested in "${listingTitle}"`,
    html: `<p>Hi ${ownerName},</p>
      <p><strong>${tenantName}</strong> is a <strong>${score}% compatibility match</strong> for your listing <strong>${listingTitle}</strong> — this is one of your strongest leads yet.</p>
      <p>Respond quickly to keep the conversation going.</p>`,
  }),
  interestAccepted: (tenantName, ownerName, listingTitle) => ({
    subject: `Your interest in "${listingTitle}" was accepted`,
    html: `<p>Hi ${tenantName},</p>
      <p><strong>${ownerName}</strong> accepted your interest in <strong>${listingTitle}</strong>. You can now chat with them directly on FlatMatch.</p>`,
  }),
  interestDeclined: (tenantName, ownerName, listingTitle) => ({
    subject: `Update on your interest in "${listingTitle}"`,
    html: `<p>Hi ${tenantName},</p>
      <p><strong>${ownerName}</strong> has declined your interest in <strong>${listingTitle}</strong>. Don't worry — keep browsing, there are more matches waiting for you on FlatMatch.</p>`,
  }),
};

module.exports = { sendEmail, templates };