const express = require('express');
const router = express.Router();

const registrationController = require('../controllers/registrationController');
const { registrationValidation, statusUpdateValidation } = require('../middleware/validation');
const { registrationRateLimit, retrievalRateLimit, sanitizeInput } = require('../middleware/security');

// @route   POST /api/registrations
// @desc    Create a new registration
// @access  Public (with rate limiting)
router.post('/', 
  registrationRateLimit,
  sanitizeInput,
  registrationValidation,
  registrationController.createRegistration
);

// @route   GET /api/registrations
// @desc    Get all registrations with filtering and pagination
// @access  Public (no authentication for simplicity as requested)
router.get('/', 
  retrievalRateLimit,
  registrationController.getAllRegistrations
);

// @route   GET /api/registrations/stats
// @desc    Get registration statistics
// @access  Public
router.get('/stats', 
  retrievalRateLimit,
  registrationController.getRegistrationStats
);

// @route   GET /api/registrations/:id
// @desc    Get a single registration by ID
// @access  Public
router.get('/:id', 
  retrievalRateLimit,
  registrationController.getRegistrationById
);

// @route   PUT /api/registrations/:id/status
// @desc    Update registration status
// @access  Public (in production, you'd want to add authentication)
router.put('/:id/status', 
  sanitizeInput,
  statusUpdateValidation,
  registrationController.updateRegistrationStatus
);

// @route   DELETE /api/registrations/:id
// @desc    Delete (soft delete) a registration
// @access  Public (in production, you'd want to add authentication)
router.delete('/:id', 
  registrationController.deleteRegistration
);

module.exports = router;