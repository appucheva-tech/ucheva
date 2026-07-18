const mongoose = require('mongoose');
const { Schema } = mongoose;

const scoreSchema = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'students', required: true, index: true },
    staffId: { type: Schema.Types.ObjectId, ref: 'staffs', required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'subjects', required: true },
    schoolUrl: { type: String, required: true },
    subject: { type: String, required: true },       // denormalized name
    className: { type: String, required: true },     // denormalized
    studentName: { type: String, required: true },   // denormalized
    admissionNumber: { type: String, required: true },
    continuousAssessment: { type: Number, default: 0 },
    exam: { type: Number, default: 0 },
    totalScore: { type: Number, default: 0 }
   
  },
  { timestamps: true }
);

scoreSchema.index({ studentId: 1, subjectId: 1 }, { unique: true });

const scoreModel = mongoose.model('scores', scoreSchema);
module.exports = scoreModel