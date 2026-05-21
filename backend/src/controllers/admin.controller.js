const ActivityLog = require('../models/ActivityLog');
const User = require('../models/User');
const ProjectMember = require('../models/ProjectMember');
const Task = require('../models/Task');
const RefreshToken = require('../models/RefreshToken');
const { success, error } = require('../utils/response');
const { logActivity } = require('../utils/activityLogger');

exports.getActivityLogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.userId) filter.user = req.query.userId;
    if (req.query.action) filter.action = req.query.action;

    const total = await ActivityLog.countDocuments(filter);
    const logs = await ActivityLog.find(filter)
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.json({ success: true, data: logs, pagination: { page, limit, total } });
  } catch (err) { next(err); }
};

exports.getLoginHistory = async (req, res, next) => {
  try {
    const logs = await ActivityLog.find({ action: { $in: ['LOGIN', 'LOGOUT'] } })
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    // Get unique users who have logged in
    const loggedInUsers = {};
    logs.forEach(log => {
      if (log.user && !loggedInUsers[log.user._id]) {
        loggedInUsers[log.user._id] = {
          ...log.user,
          lastLogin: null,
          lastLogout: null,
          loginCount: 0,
          lastIp: '',
        };
      }
    });

    // Fill in login stats per user
    logs.forEach(log => {
      if (!log.user) return;
      const u = loggedInUsers[log.user._id];
      if (log.action === 'LOGIN') {
        u.loginCount++;
        if (!u.lastLogin) { u.lastLogin = log.createdAt; u.lastIp = log.ip; }
      }
      if (log.action === 'LOGOUT' && !u.lastLogout) {
        u.lastLogout = log.createdAt;
      }
    });

    success(res, 'Login history', { users: Object.values(loggedInUsers), recentLogs: logs.slice(0, 50) });
  } catch (err) { next(err); }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const userId = req.params.id;

    // Prevent self-delete
    if (userId === req.user.id) {
      return error(res, 'You cannot delete yourself', [], 400);
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) return error(res, 'User not found', [], 404);

    // Cascade delete: remove all user's data
    await Task.updateMany({ assignee: userId }, { assignee: null });
    await Task.deleteMany({ creator: userId });
    await ProjectMember.deleteMany({ user: userId });
    await RefreshToken.deleteMany({ user: userId });
    await ActivityLog.deleteMany({ user: userId });
    await User.findByIdAndDelete(userId);

    await logActivity(req, req.user.id, 'PROFILE_UPDATE', `Deleted user: ${targetUser.name} (${targetUser.email})`);

    success(res, 'User deleted successfully', null);
  } catch (err) { next(err); }
};
