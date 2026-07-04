const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    phone: { type: String, trim: true },
    role: {
      type: String,
      enum: ['tenant', 'owner', 'admin'],
      default: 'tenant',
    },
    avatar: { type: String, default: '' },
    gender: { type: String, enum: ['male', 'female', 'other', ''], default: '' },

    // Tenant-only preferences used for compatibility scoring
    preferences: {
      preferredLocation: { type: String, default: '' },
      budgetMin: { type: Number, default: 0 },
      budgetMax: { type: Number, default: 0 },
      moveInDate: { type: Date },
      lifestyleTags: [{ type: String }], // e.g. Night Owl, Vegan, Non Smoker
      about: { type: String, default: '', maxlength: 500 },
    },

    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date },

    // Email OTP verification
    isVerified: { type: Boolean, default: false },
    otp: { type: String, select: false },
    otpExpiresAt: { type: Date, select: false },
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = function matchPassword(entered) {
  return bcrypt.compare(entered, this.password);
};

userSchema.methods.toSafeObject = function toSafeObject() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);