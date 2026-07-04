const express = require('express');
const {
  getStats,
  getUsers,
  toggleUserActive,
  getAllListings,
  removeListing,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/stats', getStats);
router.get('/users', getUsers);
router.patch('/users/:id/toggle-active', toggleUserActive);
router.get('/listings', getAllListings);
router.delete('/listings/:id', removeListing);

module.exports = router;
