const { body } = require('express-validator');

exports.createTaskRules = [
  body('title').isString().isLength({ min: 3, max: 200 }).withMessage('Title must be 3-200 characters'),
  body('description').optional().isString(),
  body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  body('status').optional().isIn(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']),
  body('dueDate').optional().isISO8601().withMessage('Valid date required'),
];

exports.updateStatusRules = [
  body('status').isIn(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']).withMessage('Invalid status'),
];
