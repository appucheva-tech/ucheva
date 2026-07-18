const mongoose = require('mongoose');
const { Schema } = mongoose;

const withdrawalSchema = new Schema(
  {
    adminId: { type: Schema.Types.ObjectId, ref: 'admins', required: true, index: true },
    walletId: { type: Schema.Types.ObjectId, ref: 'wallets', required: true, index: true },
    schoolUrl: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'NGN' },
    accountNumber: { type: String, required: true },
    accountName: { type: String, required: true },
    bankName: { type: String, required: true },
    bankCode: { type: String, required: true },
    reference: { type: String, required: true, unique: true },
    koraReference: { type: String },
    narration: { type: String, default: 'Ucheva withdrawal' },
    status: { type: String, enum: ['processing', 'successful', 'failed'], default: 'processing' },
    failureReason: { type: String },
    // was manually JSON.stringify/parse'd in a TEXT column -> native Mixed type
    providerResponse: { type: Schema.Types.Mixed },
    requestDate: { type: Date, required: true },
    processedAt: { type: Date }
  },
  { timestamps: true }
);

const withdrawalModel = mongoose.model('withdrawals', withdrawalSchema);

module.exports = withdrawalModel