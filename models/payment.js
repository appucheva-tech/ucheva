const mongoose = require('mongoose');
const { Schema } = mongoose;

const paymentSchema = new Schema(
  {
    adminId: { type: Schema.Types.ObjectId, ref: 'admins', required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'students', required: true, index: true },
    schoolUrl: { type: String, required: true },
    amount: { type: mongoose.Schema.Types.Decimal128, required: true },
    paymentType: { type: String, enum: ['card', 'bank transfer', 'mobile payment'], required: true },
    paymentStatus: { type: String, enum: ['pending', 'success', 'failed'], required: true },
    reference: { type: String, required: true, unique: true },
    currency: { type: String, enum: ['USD', 'EUR', 'NGN'], required: true },
    paymentDate: { type: Date, required: true },
    parentName: { type: String, required: true },
    parentEmail: { type: String, required: true }
  },
  { timestamps: true }
);

const paymentModel = mongoose.model('payments', paymentSchema);
module.exports = paymentModel