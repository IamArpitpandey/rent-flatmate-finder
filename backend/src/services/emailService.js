const https = require('https');

async function sendEmail({ to, subject, html }) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.log(`[email:skipped] To: ${to} | Subject: ${subject}`);
    return { skipped: true };
  }

  const payload = JSON.stringify({
    sender: { email: process.env.SMTP_USER, name: 'FlatMatch' },
    to: [{ email: to }],
    subject,
    htmlContent: html,
  });

  return new Promise((resolve) => {
    const req = https.request(
      {
        hostname: 'api.brevo.com',
        path: '/v3/smtp/email',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': apiKey,
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ success: true });
          } else {
            console.error(`[email:error] Brevo API ${res.statusCode}: ${data}`);
            resolve({ error: data });
          }
        });
      }
    );
    req.on('error', (err) => {
      console.error(`[email:error] ${err.message}`);
      resolve({ error: err.message });
    });
    req.write(payload);
    req.end();
  });
}

const templates = {
  otpVerification: (name, otp) => ({
    subject: `${otp} is your FlatMatch verification code`,
    html: `<p>Hi ${name},</p>
      <p>Your FlatMatch verification code is:</p>
      <p style="font-size:28px;font-weight:700;letter-spacing:4px;margin:16px 0;">${otp}</p>
      <p>This code expires in ${process.env.OTP_EXPIRY_MINUTES || 10} minutes.</p>`,
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
      <p><strong>${tenantName}</strong> is a <strong>${score}% compatibility match</strong> for your listing <strong>${listingTitle}</strong>.</p>
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
      <p><strong>${ownerName}</strong> has declined your interest in <strong>${listingTitle}</strong>. Keep browsing!</p>`,
  }),
};

module.exports = { sendEmail, templates };