const mongoose = require('mongoose');
const { Schema } = mongoose;

const staffSchema = new Schema(
  {
    adminId: { type: Schema.Types.ObjectId, ref: 'admins', required: true, index: true },
    staffProfileUrl: { type: String },
    staffProfilePublicId: { type: String },
    schoolUrl: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    otherName: { type: String },
    gender: { type: String, enum: ['male', 'female'], required: true },
    dateOfBirth: { type: Date, required: true },
    nationality: { type: String, enum: ['nigerian', 'non-nigerian'] },
    address: { type: String, required: true },
    maritalStatus: { type: String, enum: ['single', 'married', 'divorced', 'widowed'] },
    attendanceStatus: { type: String, enum: ['present', 'absent', 'late'], default: 'absent' },
    subjectAssigned: [{ type: String, required: false }],
    classAssigned: [{ type: String, required: false }],
    staffType: { type: String, enum: ['class teacher', 'subject teacher', 'busary', 'security'], default: 'subject teacher' },
    role: { type: String, default: 'staff' },
    password: { type: String },
    phoneNumber: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    qualification: { type: String, required: true },
    staffUrl: { type: String },
    staffPublicId: { type: String },
    signatureUrl: { type: String },
    signaturePublicId: { type: String },
    staffToken: { type: String },
    staffTokenExpiresAt: { type: Date },
    isActive: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date }
  },
  { timestamps: true }
);

const staffModel = mongoose.model('staffs', staffSchema);
module.exports = staffModel
