const mongoose = require('mongoose');

const adminProfileSchema = new mongoose.Schema(
  {
    adminId: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: 'admins'
      },
    term: { 
      type: String, 
      default: null 
    },
    academicSession: { 
      type: String, 
      default: null 
    },
    adminFirstName: { 
      type: String, 
      default: null 
    },
    adminLastName: { type: String, default: null },
    adminUrl: { type: String, default: null },
    adminPublicId: { type: String, default: null },
    schoolLogoUrl: { type: String, default: null },
    schoolLogoPublicId: { type: String, default: null },
    schoolStampUrl: { type: String, default: null },
    schoolStampPublicId: { type: String, default: null },
    schoolSignatureUrl: { type: String, default: null },
    schoolSignaturePublicId: { type: String, default: null },
    cacUrl: { type: String, default: null },
    cacPublicId: { type: String, default: null },
    nepaUrl: { type: String, default: null },
    nepaPublicId: { type: String, default: null },
    schoolType: { type: [String], default: [] },
    continuousAssessmentConfig: { type: Number, default: null },
    examConfig: { type: Number, default: null },
    total: { type: Number, default: null }
  },
  {timestamps: true}
);

const adminProfileModel = mongoose.model('adminProfiles', adminProfileSchema)

module.exports = adminProfileModel