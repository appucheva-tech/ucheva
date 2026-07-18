const mongoose = require('mongoose');
const { Schema } = mongoose;

const schoolClassSchema = new Schema(
  {
    adminId: { type: Schema.Types.ObjectId, ref: 'admins', required: true, index: true },
    staffId: { type: Schema.Types.ObjectId, ref: 'staffs' }, // class teacher
    schoolUrl: { type: String, required: true },
    className: { type: String, required: true },
    section: { type: String, required: true },
    paymentOption: { type: String, enum: ['full payment', 'installment'], required: true },
    numberOfInstallments: { type: Number },
    payableAmount: { type: Number },
    amount: { type: mongoose.Schema.Types.Decimal128, required: true },
    teacherName: { type: String }, // denormalized cache of staff name
    assigned: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const schoolClassModel = mongoose.model('schoolClasses', schoolClassSchema);
module.exports = schoolClassModel
