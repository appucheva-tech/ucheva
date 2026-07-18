const mongoose = require('mongoose');
const { Schema } = mongoose;

const messageSchema = new Schema(
  {
    adminId: { type: Schema.Types.ObjectId, ref: 'admins', required: true, index: true },
    email: { type: String, required: true },
    name: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true, maxlength: 200 }
  },
  { timestamps: true }
);

const messageModel = mongoose.model('messages', messageSchema);

module.exports = messageModel
