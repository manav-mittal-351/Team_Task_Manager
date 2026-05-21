const { verifyAccessToken } = require('../utils/jwt');
const { error } = require('../utils/response');

exports.authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return error(res, 'Access denied. No token provided.', [], 401);

  try {
    req.user = verifyAccessToken(token);
    next();
  } catch (err) {
    return error(res, 'Invalid or expired token.', [], 401);
  }
};
