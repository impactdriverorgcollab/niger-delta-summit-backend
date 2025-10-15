const { body } = require('express-validator');

const registrationValidation = [
  // Basic fields validation
  body('fullName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s\-'\.]+$/)
    .withMessage('Full name can only contain letters, spaces, hyphens, apostrophes, and periods'),

  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address')
    .isLength({ max: 150 })
    .withMessage('Email address is too long'),

  body('phone')
    .trim()
    .isMobilePhone('any', { strictMode: false })
    .withMessage('Please provide a valid phone number')
    .isLength({ max: 20 })
    .withMessage('Phone number is too long'),

  body('organization')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Organization name is too long'),

  // Registration type validation
  body('registrationType')
    .isIn(['anchor-partner', 'series-venture', 'attend'])
    .withMessage('Registration type must be: anchor-partner, series-venture, or attend'),

  // Conditional validation for anchor partners
  body('sponsorshipTier')
    .if(body('registrationType').equals('anchor-partner'))
    .notEmpty()
    .withMessage('Sponsorship tier is required for anchor partners')
    .isIn(['tier1', 'tier2', 'community', 'demoday'])
    .withMessage('Invalid sponsorship tier'),

  body('participationType')
    .if(body('registrationType').equals('anchor-partner'))
    .notEmpty()
    .withMessage('Participation type is required for anchor partners')
    .isIn(['sponsor', 'speaker', 'exhibitor', 'multiple'])
    .withMessage('Invalid participation type'),

  // Conditional validation for series ventures
  body('projectDescription')
    .if(body('registrationType').equals('series-venture'))
    .notEmpty()
    .withMessage('Project description is required for series ventures')
    .isLength({ min: 10, max: 10000 })
    .withMessage('Project description must be between 50 and 1000 characters'),

  // Clean up conditional fields
  body('sponsorshipTier')
    .if(body('registrationType').not().equals('anchor-partner'))
    .customSanitizer(value => ''),

  body('participationType')
    .if(body('registrationType').not().equals('anchor-partner'))
    .customSanitizer(value => ''),

  body('projectDescription')
    .if(body('registrationType').not().equals('series-venture'))
    .customSanitizer(value => '')
];

const statusUpdateValidation = [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['pending', 'reviewed', 'approved', 'rejected'])
    .withMessage('Status must be: pending, reviewed, approved, or rejected')
];

module.exports = {
  registrationValidation,
  statusUpdateValidation
};