const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc  Register a new user (tenant or owner)
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

  const user = await User.create({
    name,
    email,
    password,
    phone,
    gender: gender || '',
    role: ['tenant', 'owner'].includes(role) ? role : 'tenant',
  });

  generateToken(res, user._id);
  res.status(201).json({ success: true, user: user.toSafeObject() });
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
  res.json({ success: true, user: req.user.toSafeObject() });
});

module.exports = { register, login, logout, getMe, updateMe };