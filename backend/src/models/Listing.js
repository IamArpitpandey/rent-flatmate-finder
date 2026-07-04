const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, maxlength: 2000 },

    location: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      lat: { type: Number },
      lng: { type: Number },
    },

    rent: { type: Number, required: true, min: 0 },
    securityDeposit: { type: Number, default: 0 },
    availableFrom: { type: Date, required: true },

    roomType: {
      type: String,
      enum: ['single', 'shared-double', 'shared-triple', '1bhk', '2bhk', '3bhk', 'pg'],
      required: true,
    },
    furnishing: {
      type: String,
      enum: ['unfurnished', 'semi-furnished', 'fully-furnished'],
      default: 'semi-furnished',
    },
    genderPreference: { type: String, enum: ['male', 'female', 'any'], default: 'any' },

    amenities: [{ type: String }], // Wifi, AC, Parking, Fridge, Machine, PowerBackup, CCTV, TV
    photos: [{ type: String }],

    status: { type: String, enum: ['active', 'filled', 'inactive'], default: 'active' },
    viewsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

listingSchema.index({ 'location.city': 1, status: 1 });
listingSchema.index({ rent: 1 });

module.exports = mongoose.model('Listing', listingSchema);
