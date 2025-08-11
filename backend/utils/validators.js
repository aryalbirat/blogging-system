const { body } = require('express-validator');

const registerValidators = [
  body('firstName').trim().isLength({ min: 1 }).withMessage('First name is required'),
  body('lastName').trim().isLength({ min: 1 }).withMessage('Last name is required'),
  body('dob').isISO8601().withMessage('Valid date of birth is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phoneNo').trim().isLength({ min: 10 }).withMessage('Valid phone number is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('userType').isIn(['author', 'reader']).withMessage('User type must be author or reader'),
];

const loginValidators = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

module.exports = {
  registerValidators,
  loginValidators,
};


