const Task = require('../models/Task');
const ProjectMember = require('../models/ProjectMember');
const { success, error, paginated } = require('../utils/response');
const { logActivity } = require('../utils/activityLogger');

exports.getProjectTasks = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const total = await Task.countDocuments({ project: projectId });
    const tasks = await Task.find({ project: projectId })
      .populate('assignee', 'name email')
      .populate('creator', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Flatten for frontend compatibility
    const formatted = tasks.map(t => ({
      ...t,
      assigneeName: t.assignee?.name || null,
      assigneeEmail: t.assignee?.email || null,
      creatorName: t.creator?.name || null,
    }));

    paginated(res, formatted, page, limit, total);
  } catch (err) { next(err); }
};

exports.createTask = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { title, description, status, priority, dueDate, assigneeId } = req.body;

    const task = await Task.create({
      title,
      description,
      status: status || 'TODO',
      priority: priority || 'MEDIUM',
      dueDate: dueDate || null,
      project: projectId,
      assignee: assigneeId || null,
      creator: req.user.id,
    });

    const populated = await Task.findById(task._id)
      .populate('assignee', 'name email')
      .populate('creator', 'name')
      .lean();

    success(res, 'Task created', {
      ...populated,
      assigneeName: populated.assignee?.name || null,
      creatorName: populated.creator?.name || null,
    }, 201);
    await logActivity(req, req.user.id, 'TASK_CREATE', `Created task: ${title}`);
  } catch (err) { next(err); }
};

exports.getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignee', 'name email')
      .populate('creator', 'name')
      .lean();
    if (!task) return error(res, 'Task not found', [], 404);

    success(res, 'Task details', {
      ...task,
      assigneeName: task.assignee?.name || null,
      creatorName: task.creator?.name || null,
    });
  } catch (err) { next(err); }
};

exports.updateTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, dueDate, assigneeId } = req.body;
    const update = { title, description, status, priority, dueDate };
    if (assigneeId !== undefined) update.assignee = assigneeId || null;

    const task = await Task.findByIdAndUpdate(req.params.id, update, { new: true })
      .populate('assignee', 'name email')
      .lean();

    success(res, 'Task updated', {
      ...task,
      assigneeName: task.assignee?.name || null,
    });
  } catch (err) { next(err); }
};

exports.updateTaskStatus = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true }).lean();
    await logActivity(req, req.user.id, 'TASK_STATUS_CHANGE', `Changed task "${task.title}" to ${req.body.status}`);
    success(res, 'Task status updated', task);
  } catch (err) { next(err); }
};

exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return error(res, 'Task not found', [], 404);

    // Check permission: global admin, project admin, or task creator
    if (req.user.role !== 'ADMIN' && task.creator.toString() !== req.user.id) {
      const membership = await ProjectMember.findOne({ project: task.project, user: req.user.id });
      if (!membership || membership.role !== 'ADMIN') {
        return error(res, 'Only project admin or task creator can delete.', [], 403);
      }
    }

    await Task.findByIdAndDelete(req.params.id);
    await logActivity(req, req.user.id, 'TASK_DELETE', `Deleted task: ${task.title}`);
    success(res, 'Task deleted', null);
  } catch (err) { next(err); }
};
