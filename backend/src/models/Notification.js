const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: [
        'interest_received',
        'high_match_interest',
        'interest_accepted',
        'interest_declined',
        'new_message',
        'listing_filled',
      ],
      required: true,
    },
    title: { type: String, required: true },
    body: { type: String, default: '' },
    relatedListing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing' },
    relatedInterest: { type: mongoose.Schema.Types.ObjectId, ref: 'Interest' },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
