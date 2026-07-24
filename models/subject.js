const mongoose = require('mongoose');
const { Schema } = mongoose;

const subjectSchema = new Schema(
  {
    adminId: { type: Schema.Types.ObjectId, ref: 'admins', required: true, index: true },
    classId: [{ type: Schema.Types.ObjectId, ref: 'schoolClasses' }],
    staffId: { type: Schema.Types.ObjectId, ref: 'staffs' },
    schoolUrl: { type: String, required: true },
    subjectName: { type: String, required: true },
    applicableClasses: [{ type: String, required: true }],
    applicableDepartment: { type: String, required: true },
    subjectTeacher: { type: String, required: true } // denormalized cache of staff name
  },
  { timestamps: true }
);

const subjectModel = mongoose.model('subjects', subjectSchema);

module.exports = subjectModel