const { body } = require('express-validator');

exports.registerRules = [
  body('name').isString().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isStrongPassword({ minLength: 8, minUppercase: 1, minNumbers: 1, minSymbols: 0 }).withMessage('Password must be at least 8 chars with 1 uppercase and 1 number'),
];

exports.loginRules = [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required'),
];
