const { body } = require('express-validator');

exports.createProjectRules = [
  body('name').isString().isLength({ min: 3, max: 100 }).withMessage('Name must be 3-100 characters'),
  body('description').optional().isString().isLength({ max: 500 }),
];

exports.addMemberRules = [
  body('email').isEmail().withMessage('Valid email required'),
];
