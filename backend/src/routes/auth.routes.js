const router = require('express').Router();
const c = require('../controllers/auth.controller');
const { validate } = require('../middleware/validate');
const { registerRules, loginRules } = require('../validators/auth');
const { authenticateToken } = require('../middleware/auth');

router.post('/register', registerRules, validate, c.register);
router.post('/login', loginRules, validate, c.login);
router.post('/refresh', c.refresh);
router.post('/logout', authenticateToken, c.logout);
router.get('/me', authenticateToken, c.me);

module.exports = router;
