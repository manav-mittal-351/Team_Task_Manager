const Task = require('../models/Task');
const ProjectMember = require('../models/ProjectMember');
const Project = require('../models/Project');
const { success } = require('../utils/response');

exports.getStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get project IDs user is member of
    let projectIds;
    if (req.user.role === 'ADMIN') {
      const allProjects = await Project.find().select('_id');
      projectIds = allProjects.map(p => p._id);
    } else {
      const memberships = await ProjectMember.find({ user: userId }).select('project');
      projectIds = memberships.map(m => m.project);
    }

    const totalProjects = projectIds.length;

    const [taskStats] = await Task.aggregate([
      { $match: { project: { $in: projectIds } } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'DONE'] }, 1, 0] } },
          overdue: {
            $sum: {
              $cond: [
                { $and: [{ $ne: ['$status', 'DONE'] }, { $lt: ['$dueDate', new Date()] }, { $ne: ['$dueDate', null] }] },
                1, 0,
              ],
            },
          },
        },
      },
    ]);

    const statusBreakdown = await Task.aggregate([
      { $match: { project: { $in: projectIds } } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const priorityBreakdown = await Task.aggregate([
      { $match: { project: { $in: projectIds } } },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]);

    success(res, 'Dashboard stats', {
      totalProjects,
      totalTasks: taskStats?.total || 0,
      completedTasks: taskStats?.completed || 0,
      overdueTasks: taskStats?.overdue || 0,
      statusBreakdown: statusBreakdown.map(s => ({ status: s._id, count: s.count })),
      priorityBreakdown: priorityBreakdown.map(p => ({ priority: p._id, count: p.count })),
    });
  } catch (err) { next(err); }
};

exports.getOverdueTasks = async (req, res, next) => {
  try {
    const memberships = await ProjectMember.find({ user: req.user.id }).select('project');
    const projectIds = memberships.map(m => m.project);

    const tasks = await Task.find({
      project: { $in: projectIds },
      dueDate: { $lt: new Date(), $ne: null },
      status: { $ne: 'DONE' },
    })
      .populate('project', 'name')
      .sort({ dueDate: 1 })
      .lean();

    const formatted = tasks.map(t => ({
      ...t,
      projectName: t.project?.name || 'Unknown',
    }));

    success(res, 'Overdue tasks', formatted);
  } catch (err) { next(err); }
};
