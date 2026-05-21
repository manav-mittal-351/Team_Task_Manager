const { error } = require('../utils/response');
const ProjectMember = require('../models/ProjectMember');

exports.requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return error(res, 'Access denied. Insufficient permissions.', [], 403);
    }
    next();
  };
};

exports.requireProjectRole = (roles) => {
  return async (req, res, next) => {
    const projectId = req.params.projectId || req.params.id;
    if (!projectId) return error(res, 'Project ID required.', [], 400);

    // Global admin bypass
    if (req.user.role === 'ADMIN') return next();

    try {
      const membership = await ProjectMember.findOne({ user: req.user.id, project: projectId });
      if (!membership) {
        return error(res, 'Not a member of this project.', [], 403);
      }
      if (!roles.includes(membership.role)) {
        return error(res, 'Insufficient project permissions.', [], 403);
      }
      req.projectRole = membership.role;
      next();
    } catch (err) {
      next(err);
    }
  };
};
