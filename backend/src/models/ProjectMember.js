const mongoose = require('mongoose');

const projectMemberSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  role: { type: String, enum: ['ADMIN', 'MEMBER'], default: 'MEMBER' },
  joinedAt: { type: Date, default: Date.now },
});

projectMemberSchema.index({ user: 1, project: 1 }, { unique: true });

module.exports = mongoose.model('ProjectMember', projectMemberSchema);
