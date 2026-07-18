const mongoose = require('mongoose');
const { Schema } = mongoose;

const qrCodeSchema = new Schema(
  {
    adminId: { type: Schema.Types.ObjectId, ref: 'admins', required: true, index: true },
    schoolUrl: { type: String, required: true },
    qrToken: { type: String, required: true, unique: true },
    latitude: { type: Number },
    longitude: { type: Number },
    address: { type: String },
    date: { type: Date, required: true },
    expiresAt: { type: Date, required: true },
    status: { type: String, enum: ['active', 'expired'], default: 'active' }
  },
  { timestamps: true }
);

const qrCodeModel = mongoose.model('qrCodes', qrCodeSchema);
module.exports = qrCodeModel
