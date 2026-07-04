const asyncHandler = require('express-async-handler');
const Listing = require('../models/Listing');
const { getOrComputeCompatibility } = require('../services/compatibilityService');
const { uploadBuffer } = require('../config/cloudinary');

// @desc  Owner creates a listing
// @route POST /api/listings
const createListing = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    address,
    city,
    lat,
    lng,
    rent,
    securityDeposit,
    availableFrom,
    roomType,
    furnishing,
    genderPreference,
    amenities,
  } = req.body;

  if (!title || !description || !address || !city || !rent || !availableFrom || !roomType) {
    res.status(400);
    throw new Error('Missing required listing fields');
  }

  let photos = [];
  if (req.files?.length) {
    const uploads = await Promise.all(req.files.map((f) => uploadBuffer(f.buffer, 'flatmatch/listings')));
    photos = uploads.map((u) => u.secure_url);
  }

  const listing = await Listing.create({
    owner: req.user._id,
    title,
    description,
    location: { address, city, lat, lng },
    rent,
    securityDeposit: securityDeposit || 0,
    availableFrom,
    roomType,
    furnishing,
    genderPreference,
    amenities: Array.isArray(amenities) ? amenities : amenities ? JSON.parse(amenities) : [],
    photos,
  });

  res.status(201).json({ success: true, listing });
});

// @desc  Browse/search listings with filters, ranked by compatibility score for tenants
// @route GET /api/listings?city=&minRent=&maxRent=&roomType=&page=
const getListings = asyncHandler(async (req, res) => {
  const { city, minRent, maxRent, roomType, page = 1, limit = 10 } = req.query;

  const query = { status: 'active' };
  if (city) query['location.city'] = new RegExp(city, 'i');
  if (roomType) query.roomType = roomType;
  if (minRent || maxRent) {
    query.rent = {};
    if (minRent) query.rent.$gte = Number(minRent);
    if (maxRent) query.rent.$lte = Number(maxRent);
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [listings, total] = await Promise.all([
    Listing.find(query)
      .populate('owner', 'name avatar phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Listing.countDocuments(query),
  ]);

  let results = listings.map((l) => l.toObject());

  // Attach + rank by cached compatibility score when a tenant is browsing
  if (req.user?.role === 'tenant') {
    results = await Promise.all(
      results.map(async (listing) => {
        const compat = await getOrComputeCompatibility(req.user, listing);
        return { ...listing, compatibility: { score: compat.score, explanation: compat.explanation } };
      })
    );
    results.sort((a, b) => b.compatibility.score - a.compatibility.score);
  }

  res.json({
    success: true,
    listings: results,
    pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
  });
});

// @desc  Get single listing detail (+ compatibility score if tenant)
// @route GET /api/listings/:id
const getListingById = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id).populate('owner', 'name avatar phone email');
  if (!listing) {
    res.status(404);
    throw new Error('Listing not found');
  }

  listing.viewsCount += 1;
  await listing.save();

  let compatibility = null;
  if (req.user?.role === 'tenant') {
    const compat = await getOrComputeCompatibility(req.user, listing);
    compatibility = { score: compat.score, explanation: compat.explanation };
  }

  res.json({ success: true, listing, compatibility });
});

// @desc  Owner updates their own listing
// @route PUT /api/listings/:id
const updateListing = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) {
    res.status(404);
    throw new Error('Listing not found');
  }
  if (String(listing.owner) !== String(req.user._id) && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('You can only edit your own listings');
  }

  const editableFields = [
    'title',
    'description',
    'rent',
    'securityDeposit',
    'availableFrom',
    'roomType',
    'furnishing',
    'genderPreference',
    'amenities',
    'status',
  ];
  editableFields.forEach((field) => {
    if (req.body[field] !== undefined) listing[field] = req.body[field];
  });

  if (req.body.address || req.body.city) {
    listing.location.address = req.body.address || listing.location.address;
    listing.location.city = req.body.city || listing.location.city;
  }

  if (req.files?.length) {
    const uploads = await Promise.all(req.files.map((f) => uploadBuffer(f.buffer, 'flatmatch/listings')));
    listing.photos.push(...uploads.map((u) => u.secure_url));
  }

  await listing.save();
  res.json({ success: true, listing });
});

// @desc  Owner marks listing as filled (hides it from search)
// @route PATCH /api/listings/:id/fill
const markAsFilled = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) {
    res.status(404);
    throw new Error('Listing not found');
  }
  if (String(listing.owner) !== String(req.user._id) && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('You can only update your own listings');
  }
  listing.status = 'filled';
  await listing.save();
  res.json({ success: true, listing });
});

// @desc  Owner deletes a listing
// @route DELETE /api/listings/:id
const deleteListing = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) {
    res.status(404);
    throw new Error('Listing not found');
  }
  if (String(listing.owner) !== String(req.user._id) && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('You can only delete your own listings');
  }
  await listing.deleteOne();
  res.json({ success: true, message: 'Listing deleted' });
});

// @desc  Owner's own listings
// @route GET /api/listings/mine/all
const getMyListings = asyncHandler(async (req, res) => {
  const listings = await Listing.find({ owner: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, listings });
});

module.exports = {
  createListing,
  getListings,
  getListingById,
  updateListing,
  markAsFilled,
  deleteListing,
  getMyListings,
};
