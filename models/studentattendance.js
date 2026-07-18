const mongoose = require('mongoose');
const { Schema } = mongoose;

const studentAttendanceSchema = new Schema(
  {
    // FIX: original Sequelize model pointed studentId's FK reference at the
    // "admins" table (copy-paste bug) instead of "students". Corrected here.
    studentId: { type: Schema.Types.ObjectId, ref: 'students', required: true, index: true },
    staffId: { type: Schema.Types.ObjectId, ref: 'staffs', required: true },
    schoolUrl: { type: String, required: true },
    date: { type: Date, required: true },
    status: { type: String, enum: ['present', 'absent'], required: true },
    studentClass: { type: String },       // denormalized
    studentName: { type: String, required: true }, // denormalized
    classTeacher: { type: String, required: true }, // denormalized
    whatsAppNotification: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const studentAttendanceModel = mongoose.model('studentAttendances', studentAttendanceSchema);

module.exports = studentAttendanceModel