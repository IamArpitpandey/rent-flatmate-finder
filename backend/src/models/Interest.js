const mongoose = require('mongoose');

const interestSchema = new mongoose.Schema(
  {
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending',
    },
    compatibilityScore: { type: mongoose.Schema.Types.ObjectId, ref: 'CompatibilityScore' },
    message: { type: String, default: '', maxlength: 500 },
    respondedAt: { type: Date },
  },
  { timestamps: true }
);

interestSchema.index({ tenant: 1, listing: 1 }, { unique: true });

module.exports = mongoose.model('Interest', interestSchema);
