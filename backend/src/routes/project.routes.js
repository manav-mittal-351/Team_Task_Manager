const router = require('express').Router();
const c = require('../controllers/project.controller');
const { authenticateToken } = require('../middleware/auth');
const { requireProjectRole } = require('../middleware/rbac');
const { validate } = require('../middleware/validate');
const { createProjectRules, addMemberRules } = require('../validators/project');

router.use(authenticateToken);
router.get('/', c.getAllProjects);
router.post('/', createProjectRules, validate, c.createProject);
router.get('/:id', requireProjectRole(['ADMIN', 'MEMBER']), c.getProjectById);
router.put('/:id', requireProjectRole(['ADMIN']), c.updateProject);
router.delete('/:id', requireProjectRole(['ADMIN']), c.deleteProject);
router.post('/:id/members', requireProjectRole(['ADMIN']), addMemberRules, validate, c.addMember);
router.delete('/:id/members/:userId', requireProjectRole(['ADMIN']), c.removeMember);
router.put('/:id/members/:userId/role', requireProjectRole(['ADMIN']), c.changeMemberRole);

module.exports = router;
