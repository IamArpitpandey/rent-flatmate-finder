const asyncHandler = require('express-async-handler');
const Interest = require('../models/Interest');
const Listing = require('../models/Listing');
const Notification = require('../models/Notification');
const { getOrComputeCompatibility } = require('../services/compatibilityService');
const { sendEmail, templates } = require('../services/emailService');
const { getIO } = require('../services/socketService');

const HIGH_MATCH_THRESHOLD = Number(process.env.HIGH_MATCH_THRESHOLD) || 80;

// @desc  Tenant expresses interest in a listing
// @route POST /api/interests
const createInterest = asyncHandler(async (req, res) => {
  const { listingId, message } = req.body;

  const listing = await Listing.findById(listingId).populate('owner');
  if (!listing || listing.status !== 'active') {
    res.status(404);
    throw new Error('Listing not found or no longer available');
  }

  const already = await Interest.findOne({ tenant: req.user._id, listing: listingId });
  if (already) {
    res.status(409);
    throw new Error('You have already expressed interest in this listing');
  }

  const compat = await getOrComputeCompatibility(req.user, listing);

  const interest = await Interest.create({
    tenant: req.user._id,
    owner: listing.owner._id,
    listing: listingId,
    compatibilityScore: compat._id,
    message: message || '',
  });

  await Notification.create({
    user: listing.owner._id,
    type: compat.score >= HIGH_MATCH_THRESHOLD ? 'high_match_interest' : 'interest_received',
    title:
      compat.score >= HIGH_MATCH_THRESHOLD
        ? `🔥 ${req.user.name} is a ${compat.score}% match for "${listing.title}"`
        : `${req.user.name} is interested in "${listing.title}"`,
    body: compat.explanation,
    relatedListing: listing._id,
    relatedInterest: interest._id,
  });

  // Real-time push if owner is online
  try {
    getIO().to(`user:${listing.owner._id}`).emit('notification:new', { type: 'interest_received' });
  } catch (_) {
    /* socket not initialized in some environments (e.g. tests) - safe to ignore */
  }

  // Email: always notify owner of interest; escalate subject line for high matches
  const tpl =
    compat.score >= HIGH_MATCH_THRESHOLD
      ? templates.highMatchInterest(listing.owner.name, req.user.name, listing.title, compat.score)
      : templates.interestReceived(listing.owner.name, req.user.name, listing.title, compat.score);
  sendEmail({ to: listing.owner.email, ...tpl });

  res.status(201).json({ success: true, interest, compatibility: { score: compat.score, explanation: compat.explanation } });
});

// @desc  Owner responds to an interest request
// @route PATCH /api/interests/:id/respond
const respondToInterest = asyncHandler(async (req, res) => {
  const { action } = req.body; // 'accept' | 'decline'
  if (!['accept', 'decline'].includes(action)) {
    res.status(400);
    throw new Error('Action must be either accept or decline');
  }

  const interest = await Interest.findById(req.params.id).populate('tenant').populate('listing');
  if (!interest) {
    res.status(404);
    throw new Error('Interest request not found');
  }
  if (String(interest.owner) !== String(req.user._id)) {
    res.status(403);
    throw new Error('You can only respond to interests on your own listings');
  }
  if (interest.status !== 'pending') {
    res.status(409);
    throw new Error('This interest request has already been responded to');
  }

  interest.status = action === 'accept' ? 'accepted' : 'declined';
  interest.respondedAt = new Date();
  await interest.save();

  await Notification.create({
    user: interest.tenant._id,
    type: action === 'accept' ? 'interest_accepted' : 'interest_declined',
    title:
      action === 'accept'
        ? `${req.user.name} accepted your interest in "${interest.listing.title}"`
        : `${req.user.name} declined your interest in "${interest.listing.title}"`,
    relatedListing: interest.listing._id,
    relatedInterest: interest._id,
  });

  try {
    getIO().to(`user:${interest.tenant._id}`).emit('notification:new', {
      type: action === 'accept' ? 'interest_accepted' : 'interest_declined',
    });
  } catch (_) {
    /* ignore if socket not initialized */
  }

  const tpl =
    action === 'accept'
      ? templates.interestAccepted(interest.tenant.name, req.user.name, interest.listing.title)
      : templates.interestDeclined(interest.tenant.name, req.user.name, interest.listing.title);
  sendEmail({ to: interest.tenant.email, ...tpl });

  res.json({ success: true, interest });
});

// @desc  Tenant's own interest requests
// @route GET /api/interests/mine
const getMyInterests = asyncHandler(async (req, res) => {
  const filter = req.user.role === 'owner' ? { owner: req.user._id } : { tenant: req.user._id };
  const interests = await Interest.find(filter)
    .populate('listing')
    .populate('tenant', 'name avatar phone')
    .populate('owner', 'name avatar phone')
    .populate('compatibilityScore')
    .sort({ createdAt: -1 });
  res.json({ success: true, interests });
});

module.exports = { createInterest, respondToInterest, getMyInterests };
