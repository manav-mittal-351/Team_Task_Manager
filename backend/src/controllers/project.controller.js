const Project = require('../models/Project');
const ProjectMember = require('../models/ProjectMember');
const Task = require('../models/Task');
const User = require('../models/User');
const { success, error } = require('../utils/response');
const { logActivity } = require('../utils/activityLogger');

exports.getAllProjects = async (req, res, next) => {
  try {
    let projects;
    if (req.user.role === 'ADMIN') {
      projects = await Project.find().sort({ createdAt: -1 }).lean();
    } else {
      const memberships = await ProjectMember.find({ user: req.user.id }).select('project role');
      const projectIds = memberships.map(m => m.project);
      const roleMap = {};
      memberships.forEach(m => { roleMap[m.project.toString()] = m.role; });
      projects = await Project.find({ _id: { $in: projectIds } }).sort({ createdAt: -1 }).lean();
      projects = projects.map(p => ({ ...p, yourRole: roleMap[p._id.toString()] }));
    }

    // Attach counts
    for (const p of projects) {
      p.memberCount = await ProjectMember.countDocuments({ project: p._id });
      p.taskCount = await Task.countDocuments({ project: p._id });
      if (!p.yourRole && req.user.role === 'ADMIN') {
        const membership = await ProjectMember.findOne({ user: req.user.id, project: p._id });
        p.yourRole = membership ? membership.role : 'ADMIN';
      }
    }

    success(res, 'Projects fetched', projects);
  } catch (err) { next(err); }
};

exports.createProject = async (req, res, next) => {
  try {
    const project = await Project.create({ name: req.body.name, description: req.body.description, owner: req.user.id });
    await ProjectMember.create({ user: req.user.id, project: project._id, role: 'ADMIN' });
    await logActivity(req, req.user.id, 'PROJECT_CREATE', `Created project: ${req.body.name}`);
    success(res, 'Project created', project, 201);
  } catch (err) { next(err); }
};

exports.getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id).lean();
    if (!project) return error(res, 'Project not found', [], 404);

    const memberships = await ProjectMember.find({ project: project._id }).populate('user', 'name email');
    project.members = memberships.map(m => ({
      memberId: m._id,
      role: m.role,
      _id: m.user._id,
      name: m.user.name,
      email: m.user.email,
    }));

    success(res, 'Project details', project);
  } catch (err) { next(err); }
};

exports.updateProject = async (req, res, next) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, { name: req.body.name, description: req.body.description }, { new: true });
    await logActivity(req, req.user.id, 'PROJECT_UPDATE', `Updated project: ${project.name}`);
    success(res, 'Project updated', project);
  } catch (err) { next(err); }
};

exports.deleteProject = async (req, res, next) => {
  try {
    const proj = await Project.findById(req.params.id);
    await Task.deleteMany({ project: req.params.id });
    await ProjectMember.deleteMany({ project: req.params.id });
    await Project.findByIdAndDelete(req.params.id);
    await logActivity(req, req.user.id, 'PROJECT_DELETE', `Deleted project: ${proj?.name}`);
    success(res, 'Project deleted', null);
  } catch (err) { next(err); }
};

exports.addMember = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return error(res, 'User not found with that email', [], 404);

    const existing = await ProjectMember.findOne({ user: user._id, project: req.params.id });
    if (existing) return error(res, 'User is already a member', [], 400);

    await ProjectMember.create({ user: user._id, project: req.params.id, role: 'MEMBER' });
    await logActivity(req, req.user.id, 'MEMBER_ADD', `Added ${req.body.email} to project`);
    success(res, 'Member added', null, 201);
  } catch (err) { next(err); }
};

exports.removeMember = async (req, res, next) => {
  try {
    await ProjectMember.deleteOne({ project: req.params.id, user: req.params.userId });
    success(res, 'Member removed', null);
  } catch (err) { next(err); }
};

exports.changeMemberRole = async (req, res, next) => {
  try {
    await ProjectMember.updateOne({ project: req.params.id, user: req.params.userId }, { role: req.body.role });
    success(res, 'Member role updated', null);
  } catch (err) { next(err); }
};
