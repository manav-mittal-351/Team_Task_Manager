const ActivityLog = require('../models/ActivityLog');

exports.logActivity = async (req, userId, action, details = '') => {
  try {
    await ActivityLog.create({
      user: userId,
      action,
      details,
      ip: req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress || '',
      userAgent: req.headers['user-agent'] || '',
    });
  } catch (err) {
    console.error('Failed to log activity:', err.message);
  }
};
