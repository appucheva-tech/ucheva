const mongoose = require('mongoose');
const { Schema } = mongoose;

const announcementSchema = new Schema(
  {
    adminId: { type: Schema.Types.ObjectId, ref: 'admins', required: true, index: true },
    schoolUrl: { type: String, required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    audience: { type: String, enum: ['staff', 'parents', 'all'], default: 'all' },
    status: { type: String, enum: ['draft', 'scheduled', 'template', 'sent'], default: 'draft' },
    scheduledAt: { type: Date },
    sentAt: { type: Date }
  },
  { timestamps: true }
);

const announcementModel = mongoose.model('announcements', announcementSchema);
module.exports = announcementModel
