const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Listing = require('../models/Listing');
const Interest = require('../models/Interest');
const Message = require('../models/Message');

// @desc  Platform-wide stats
// @route GET /api/admin/stats
const getStats = asyncHandler(async (req, res) => {
  const [totalUsers, totalTenants, totalOwners, totalListings, activeListings, totalInterests, acceptedInterests, totalMessages] =
    await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'tenant' }),
      User.countDocuments({ role: 'owner' }),
      Listing.countDocuments(),
      Listing.countDocuments({ status: 'active' }),
      Interest.countDocuments(),
      Interest.countDocuments({ status: 'accepted' }),
      Message.countDocuments(),
    ]);

  res.json({
    success: true,
    stats: {
      totalUsers,
      totalTenants,
      totalOwners,
      totalListings,
      activeListings,
      totalInterests,
      acceptedInterests,
      totalMessages,
    },
  });
});

// @desc  List all users
// @route GET /api/admin/users
const getUsers = asyncHandler(async (req, res) => {
  const { role, page = 1, limit = 20 } = req.query;
  const query = role ? { role } : {};
  const users = await User.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));
  const total = await User.countDocuments(query);
  res.json({ success: true, users, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } });
});

// @desc  Activate/deactivate a user
// @route PATCH /api/admin/users/:id/toggle-active
const toggleUserActive = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  if (user.role === 'admin') {
    res.status(403);
    throw new Error('Cannot deactivate an admin account');
  }
  user.isActive = !user.isActive;
  await user.save();
  res.json({ success: true, user: user.toSafeObject() });
});

// @desc  List all listings (any status) for moderation
// @route GET /api/admin/listings
const getAllListings = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const listings = await Listing.find()
    .populate('owner', 'name email')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));
  const total = await Listing.countDocuments();
  res.json({ success: true, listings, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } });
});

// @desc  Admin removes a listing (moderation)
// @route DELETE /api/admin/listings/:id
const removeListing = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) {
    res.status(404);
    throw new Error('Listing not found');
  }
  await listing.deleteOne();
  res.json({ success: true, message: 'Listing removed' });
});

module.exports = { getStats, getUsers, toggleUserActive, getAllListings, removeListing };
