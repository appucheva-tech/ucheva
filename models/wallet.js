const mongoose = require('mongoose');
const { Schema } = mongoose;

const walletSchema = new Schema(
  {
    adminId: { type: Schema.Types.ObjectId, ref: 'admins', required: true, unique: true },
    schoolUrl: { type: String, required: true },
    paymentReceived: { type: Number, default: 0 },
    withdrawal: { type: Number, default: 0 },
    balance: { type: Number, default: 0 },
    totalTransaction: { type: Number, default: 0 }
  },
  { timestamps: true }
);

const walletModel = mongoose.model('wallets', walletSchema);

module.exports = walletModel
