const mongoose = require('mongoose');
const { Schema } = mongoose;

const parentSchema = new Schema(
  {
    adminId: { type: Schema.Types.ObjectId, ref: 'admins', required: true, index: true },
    schoolUrl: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String },
    address: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    role: { type: String, default: 'parent' },
    profileUrl: { type: String },
    profilePublicId: { type: String },
    password: { type: String },
    parentToken: { type: String },
    parentTokenExpiresAt: { type: Date },
    isActive: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date }
  },
  { timestamps: true }
);

const parentModel = mongoose.model('parents', parentSchema);
module.exports = parentModel
