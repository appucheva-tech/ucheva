const mongoose = require('mongoose');
const { Schema } = mongoose;

const announcementReadSchema = new Schema(
  {
    adminId: { type: Schema.Types.ObjectId, ref: 'admins', required: true, index: true },
    announcementId: { type: Schema.Types.ObjectId, ref: 'announcements', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, required: true, index: true },
    userRole: { type: String, default: 'bursary' },
    readAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

announcementReadSchema.index({ announcementId: 1, userId: 1 }, { unique: true });

const announcementReadModel = mongoose.model('announcementReads', announcementReadSchema);
module.exports = announcementReadModel;
