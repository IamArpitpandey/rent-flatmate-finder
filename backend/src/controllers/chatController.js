const asyncHandler = require('express-async-handler');
const Interest = require('../models/Interest');
const Message = require('../models/Message');

// @desc  Get chat message history for an accepted interest
// @route GET /api/chat/:interestId
const getMessages = asyncHandler(async (req, res) => {
  const interest = await Interest.findById(req.params.interestId);
  if (!interest || interest.status !== 'accepted') {
    res.status(404);
    throw new Error('Conversation not found or not yet active');
  }

  const isParticipant =
    String(interest.tenant) === String(req.user._id) || String(interest.owner) === String(req.user._id);
  if (!isParticipant) {
    res.status(403);
    throw new Error('You are not part of this conversation');
  }

  const messages = await Message.find({ interest: req.params.interestId })
    .populate('sender', 'name avatar')
    .sort({ createdAt: 1 });

  await Message.updateMany(
    { interest: req.params.interestId, sender: { $ne: req.user._id }, readAt: null },
    { readAt: new Date() }
  );

  res.json({ success: true, messages });
});

module.exports = { getMessages };
