const router = require('express').Router();
const c = require('../controllers/admin.controller');
const { authenticateToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

router.use(authenticateToken);
router.use(requireRole(['ADMIN']));

router.get('/activity-logs', c.getActivityLogs);
router.get('/login-history', c.getLoginHistory);
router.delete('/users/:id', c.deleteUser);

module.exports = router;
