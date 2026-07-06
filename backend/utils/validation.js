const { body, param, validationResult } = require('express-validator');

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errors.array()[0].msg,
      errors: errors.array()
    });
  }
  next();
};

const registerRules = [
  body('fullName').trim().notEmpty().withMessage('Full name is required.'),
  body('email').trim().isEmail().withMessage('Please enter a valid email address.').normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters.')
    .matches(/[A-Za-z]/)
    .withMessage('Password must contain at least one letter.')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number.'),
  body('phoneNumber')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^[0-9+\-\s()]{7,15}$/)
    .withMessage('Please enter a valid phone number.')
];

const loginRules = [
  body('email').trim().isEmail().withMessage('Please enter a valid email address.').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required.')
];

const profileUpdateRules = [
  body('fullName').optional().trim().notEmpty().withMessage('Full name cannot be empty.'),
  body('phoneNumber')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^[0-9+\-\s()]{7,15}$/)
    .withMessage('Please enter a valid phone number.'),
  body('password')
    .optional({ checkFalsy: true })
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters.')
];

const buyPlanRules = [
  body('planName').trim().notEmpty().withMessage('Plan name is required.'),
  body('amount').isNumeric().withMessage('Amount must be a number.'),
  body('paymentMethod').optional().trim()
];

const mongoIdParam = [
  param('id').isMongoId().withMessage('Invalid ID provided.')
];

module.exports = {
  handleValidation,
  registerRules,
  loginRules,
  profileUpdateRules,
  buyPlanRules,
  mongoIdParam
};
