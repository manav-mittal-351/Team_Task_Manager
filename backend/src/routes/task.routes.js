const router = require('express').Router();
const c = require('../controllers/task.controller');
const { authenticateToken } = require('../middleware/auth');
const { requireProjectRole } = require('../middleware/rbac');
const { validate } = require('../middleware/validate');
const { createTaskRules, updateStatusRules } = require('../validators/task');

router.use(authenticateToken);
router.get('/project/:projectId', requireProjectRole(['ADMIN', 'MEMBER']), c.getProjectTasks);
router.post('/project/:projectId', requireProjectRole(['ADMIN', 'MEMBER']), createTaskRules, validate, c.createTask);
router.get('/:id', c.getTaskById);
router.put('/:id', createTaskRules, validate, c.updateTask);
router.patch('/:id/status', updateStatusRules, validate, c.updateTaskStatus);
router.delete('/:id', c.deleteTask);

module.exports = router;
