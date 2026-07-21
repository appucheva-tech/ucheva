const mongoose = require('mongoose');
const { Schema } = mongoose;

const studentSchema = new Schema(
  {
    adminId: { type: Schema.Types.ObjectId, ref: 'admins', required: true, index: true },
    parentId: { type: Schema.Types.ObjectId, ref: 'parents' },
    classId: { type: Schema.Types.ObjectId, ref: 'schoolClasses', required: true, index: true },
    schoolUrl: { type: String, required: true },
    admissionNumber: { type: String, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    otherName: { type: String },
    gender: { type: String, enum: ['male', 'female'], required: true },
    dateOfBirth: { type: Date, required: true },
    nationality: { type: String, enum: ['nigerian', 'non nigerian'], required: true },
    address: { type: String, required: true },
    studentClass: { type: String, required: true },
    department: { type: String },
    attendanceStatus: { type: String, enum: ['present', 'absent'] },
    session: { type: String },
    religion: { type: String },
    parentGuardiansFirstName: { type: String, required: true },
    parentGuardiansLastName: { type: String, required: true },
    parentGuardiansAddress: { type: String, required: true },
    relationship: { type: String, enum: ['father', 'mother', 'guardian'], required: true },
    phoneNumber: { type: String, required: true },
    parentGuardiansEmail: { type: String, required: true },
    balance: { type: Number },
    paymentStatus: { type: String, enum: ['paid', 'part payment', 'unpaid'], default: 'unpaid' }
  },
  { timestamps: true }
);


const studentModel = mongoose.model('students', studentSchema);

module.exports =  studentModel