const { validationResult } = require('express-validator');
const { error } = require('../utils/response');

exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return error(res, 'Validation error', errors.array(), 400);
  }
  next();
};
