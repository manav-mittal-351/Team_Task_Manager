const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: {
    type: String,
    enum: [
      'LOGIN', 'LOGOUT', 'REGISTER',
      'PROJECT_CREATE', 'PROJECT_UPDATE', 'PROJECT_DELETE',
      'TASK_CREATE', 'TASK_UPDATE', 'TASK_DELETE', 'TASK_STATUS_CHANGE',
      'MEMBER_ADD', 'MEMBER_REMOVE',
      'PROFILE_UPDATE',
    ],
    required: true,
  },
  details: { type: String, default: '' },
  ip: { type: String, default: '' },
  userAgent: { type: String, default: '' },
}, { timestamps: true });

activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
