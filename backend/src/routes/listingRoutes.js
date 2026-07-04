const express = require('express');
const {
  createListing,
  getListings,
  getListingById,
  updateListing,
  markAsFilled,
  deleteListing,
  getMyListings,
} = require('../controllers/listingController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.get('/', protect, getListings);
router.get('/mine/all', protect, authorize('owner', 'admin'), getMyListings);
router.get('/:id', protect, getListingById);
router.post('/', protect, authorize('owner', 'admin'), upload.array('photos', 6), createListing);
router.put('/:id', protect, authorize('owner', 'admin'), upload.array('photos', 6), updateListing);
router.patch('/:id/fill', protect, authorize('owner', 'admin'), markAsFilled);
router.delete('/:id', protect, authorize('owner', 'admin'), deleteListing);

module.exports = router;
