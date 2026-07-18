const mongoose = require('mongoose');
const { Schema } = mongoose;

const staffAttendanceSchema = new Schema(
  {
    adminId: { type: Schema.Types.ObjectId, ref: 'admins', required: true, index: true },
    staffId: { type: Schema.Types.ObjectId, ref: 'staffs', required: true, index: true },
    schoolUrl: { type: String, required: true },
    qrToken: { type: String, required: true },
    date: { type: Date, required: true }, // date-only value, store at midnight
    timeCheckedIn: { type: Date },
    timeCheckedOut: { type: Date },
    // FIX: original defaultValue was 'Present' (capitalized), which didn't
    // match the lowercase enum values below and would have thrown at save time.
    status: { type: String, enum: ['present', 'absent', 'late'], default: 'absent' },
    latitude: { type: Number },
    longitude: { type: Number }
  },
  { timestamps: true }
);

const staffAttendanceModel = mongoose.model('staffAttendances', staffAttendanceSchema);
module.exports = staffAttendanceModel
