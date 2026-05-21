const router = require('express').Router();
const c = require('../controllers/dashboard.controller');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);
router.get('/stats', c.getStats);
router.get('/overdue', c.getOverdueTasks);

module.exports = router;
