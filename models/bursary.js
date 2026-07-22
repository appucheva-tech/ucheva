const mongoose = require('mongoose');
const { Schema } = mongoose;

const bursarySchema = new Schema(
  {
    adminId: { type: Schema.Types.ObjectId, ref: 'admins', required: true, unique: true, index: true },
    staffId: { type: Schema.Types.ObjectId, ref: 'staffs' },
    schoolUrl: { type: String, required: true, index: true },
    displayName: { type: String, trim: true, default: 'Bursary' },
    roleTitle: { type: String, trim: true, default: 'Bursary' },
    currentSession: { type: String, trim: true },
    currentTerm: { type: String, trim: true },
    attendanceLabel: { type: String, trim: true, default: 'My Attendance' },
    checkoutInstruction: {
      type: String,
      trim: true,
      default: 'Please scan the QR code to mark your attendance'
    },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

const bursaryModel = mongoose.model('bursaries', bursarySchema);
module.exports = bursaryModel;
