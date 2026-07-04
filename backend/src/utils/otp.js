const crypto = require('crypto');

/** Generates a 6-digit numeric OTP as a string (e.g. "042817"). */
const generateOtp = () => String(crypto.randomInt(100000, 999999));

/** Hashes an OTP before storing it, same idea as password hashing but
 *  lighter (SHA-256 is enough here — OTPs are short-lived and single-use). */
const hashOtp = (otp) => crypto.createHash('sha256').update(otp).digest('hex');

const getOtpExpiry = () => {
  const minutes = Number(process.env.OTP_EXPIRY_MINUTES) || 10;
  return new Date(Date.now() + minutes * 60 * 1000);
};

module.exports = { generateOtp, hashOtp, getOtpExpiry };