const mongoose = require('mongoose');
const { Schema } = mongoose;

const securityDashboardSchema = new Schema(
  {
    adminId: { type: Schema.Types.ObjectId, ref: 'admins', required: true, index: true },
    staffId: { type: Schema.Types.ObjectId, ref: 'staffs', required: true, index: true },
    schoolUrl: { type: String, required: true, index: true },
    date: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: ['not_checked_in', 'checked_in', 'checked_out'],
      default: 'not_checked_in'
    },
    timeCheckedIn: { type: Date },
    timeCheckedOut: { type: Date },
    lastActionAt: { type: Date },
    latitude: { type: Number },
    longitude: { type: Number },
    roleTitle: { type: String, default: 'Security' },
    profileUploadHint: { type: String, default: 'PNG, JPG, Max 2MB' },
    profileSettingsRequiredFields: {
      type: [String],
      default: ['firstName', 'lastName', 'phoneNumber', 'email', 'address']
    },
    passwordChangeRequiredFields: {
      type: [String],
      default: ['oldPassword', 'newPassword', 'confirmPassword']
    }
  },
  { timestamps: true }
);

securityDashboardSchema.index({ staffId: 1, schoolUrl: 1, date: 1 }, { unique: true });

const securityDashboardModel = mongoose.model('securityDashboards', securityDashboardSchema);
module.exports = securityDashboardModel;
