const router = require('express').Router();
const c = require('../controllers/user.controller');
const { authenticateToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

router.use(authenticateToken);
router.get('/', requireRole(['ADMIN']), c.getAllUsers);
router.get('/:id', c.getUserById);
router.put('/:id', c.updateProfile);
router.delete('/:id', requireRole(['ADMIN']), c.deleteUser);

module.exports = router;
