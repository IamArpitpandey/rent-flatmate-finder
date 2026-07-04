const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { generateOtp, hashOtp, getOtpExpiry } = require('../utils/otp');
const { sendEmail, templates } = require('../services/emailService');
const CompatibilityScore = require('../models/CompatibilityScore');

// @desc  Register a new user (tenant or owner) - sends an OTP, does not log in yet
// @route POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role, gender } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Name, email and password are required');
  }

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) {
    res.status(409);
    throw new Error('An account with this email already exists');
  }

  const otp = generateOtp();

  const user = await User.create({
    name,
    email,
    password,
    phone,
    gender: gender || '',
    role: ['tenant', 'owner'].includes(role) ? role : 'tenant',
    isVerified: false,
    otp: hashOtp(otp),
    otpExpiresAt: getOtpExpiry(),
  });

  const tpl = templates.otpVerification(user.name, otp);
  await sendEmail({ to: user.email, ...tpl });

  // No cookie/token yet — account only becomes usable after OTP verification
  res.status(201).json({
    success: true,
    needsVerification: true,
    email: user.email,
    message: 'A verification code has been sent to your email',
  });
});

// @desc  Verify the OTP sent at registration (or via resend) and log the user in
// @route POST /api/auth/verify-otp
const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    res.status(400);
    throw new Error('Email and OTP are required');
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+otp +otpExpiresAt');
  if (!user) {
    res.status(404);
    throw new Error('No account found with this email');
  }
  if (user.isVerified) {
    res.status(400);
    throw new Error('This account is already verified — please log in');
  }
  if (!user.otp || !user.otpExpiresAt || user.otpExpiresAt < new Date()) {
    res.status(400);
    throw new Error('This code has expired — request a new one');
  }
  if (hashOtp(otp) !== user.otp) {
    res.status(400);
    throw new Error('Incorrect verification code');
  }

  user.isVerified = true;
  user.otp = undefined;
  user.otpExpiresAt = undefined;
  user.lastLoginAt = new Date();
  await user.save();

  generateToken(res, user._id);
  res.json({ success: true, user: user.toSafeObject() });
});

// @desc  Resend a fresh OTP to an unverified account
// @route POST /api/auth/resend-otp
const resendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    res.status(400);
    throw new Error('Email is required');
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    res.status(404);
    throw new Error('No account found with this email');
  }
  if (user.isVerified) {
    res.status(400);
    throw new Error('This account is already verified — please log in');
  }

  const otp = generateOtp();
  user.otp = hashOtp(otp);
  user.otpExpiresAt = getOtpExpiry();
  await user.save();

  const tpl = templates.otpVerification(user.name, otp);
  await sendEmail({ to: user.email, ...tpl });

  res.json({ success: true, message: 'A new verification code has been sent' });
});

// @desc  Login
// @route POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email?.toLowerCase() }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }
  if (!user.isActive) {
    res.status(403);
    throw new Error('This account has been deactivated');
  }
  if (!user.isVerified) {
    return res.status(403).json({
      success: false,
      needsVerification: true,
      email: user.email,
      message: 'Please verify your email before logging in',
    });
  }

  user.lastLoginAt = new Date();
  await user.save();

  generateToken(res, user._id);
  res.json({ success: true, user: user.toSafeObject() });
});

// @desc  Logout - clears cookie
// @route POST /api/auth/logout
const logout = asyncHandler(async (req, res) => {
  res.cookie('token', '', { httpOnly: true, expires: new Date(0) });
  res.json({ success: true, message: 'Logged out' });
});

// @desc  Get current logged-in user
// @route GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user.toSafeObject() });
});

// @desc  Update own profile / tenant preferences
// @route PUT /api/auth/me
const updateMe = asyncHandler(async (req, res) => {
  const { name, phone, gender, avatar, preferences } = req.body;

  if (name !== undefined) req.user.name = name;
  if (phone !== undefined) req.user.phone = phone;
  if (gender !== undefined) req.user.gender = gender;
  if (avatar !== undefined) req.user.avatar = avatar;

  if (preferences && req.user.role === 'tenant') {
    req.user.preferences = {
      ...req.user.preferences.toObject(),
      ...preferences,
    };
  }

  await req.user.save();

  if (preferences && req.user.role === 'tenant') {
    await CompatibilityScore.deleteMany({ tenant: req.user._id });
  }
  res.json({ success: true, user: req.user.toSafeObject() });
});

module.exports = { register, login, logout, getMe, updateMe, verifyOtp, resendOtp };