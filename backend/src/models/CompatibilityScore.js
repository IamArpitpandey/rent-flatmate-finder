const mongoose = require('mongoose');

const compatibilityScoreSchema = new mongoose.Schema(
  {
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
    score: { type: Number, required: true, min: 0, max: 100 },
    explanation: { type: String, required: true },
    method: { type: String, enum: ['llm', 'fallback'], default: 'llm' },
  },
  { timestamps: true }
);

// One cached score per tenant-listing pair. Recompute only if listing/prefs change (handled in service).
compatibilityScoreSchema.index({ tenant: 1, listing: 1 }, { unique: true });

module.exports = mongoose.model('CompatibilityScore', compatibilityScoreSchema);
