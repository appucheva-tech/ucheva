const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema(
  {
    schoolName: { type: String, required: true, unique: true, trim: true },
    schoolUrl: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    address: { type: String, required: true },
    phoneNumber: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'admin' },
    finishedOnboarding: { type: Boolean, default: false },
    otp: { type: String },
    otpExpiresAt: { type: Date },
    isVerified: { type: Boolean, default: false },
    passwordReset: { type: Boolean, default: false },
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },
  },
  { timestamps: true }
);

const adminModel = mongoose.model('admins', adminSchema);

module.exports = adminModel
