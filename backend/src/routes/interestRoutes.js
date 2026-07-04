const express = require('express');
const { createInterest, respondToInterest, getMyInterests } = require('../controllers/interestController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, authorize('tenant'), createInterest);
router.patch('/:id/respond', protect, authorize('owner', 'admin'), respondToInterest);
router.get('/mine', protect, getMyInterests);

module.exports = router;
