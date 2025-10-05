const { validationResult } = require('express-validator');
const Registration = require('../models/Registration');

class RegistrationController {
  // Create a new registration
  async createRegistration(req, res) {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      // Extract IP address and user agent
      const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];

      // Create registration data
      const registrationData = {
        fullName: req.body.fullName,
        email: req.body.email,
        phone: req.body.phone,
        organization: req.body.organization || '',
        registrationType: req.body.registrationType,
        ipAddress,
        userAgent
      };

      // Add type-specific fields
      if (req.body.registrationType === 'anchor-partner') {
        registrationData.sponsorshipTier = req.body.sponsorshipTier;
        registrationData.participationType = req.body.participationType;
      } else if (req.body.registrationType === 'series-venture') {
        registrationData.ventureStage = req.body.ventureStage;
        registrationData.location = req.body.location;
        registrationData.teamSize = req.body.teamSize;
        registrationData.projectDescription = req.body.projectDescription;
        registrationData.fundingNeeds = req.body.fundingNeeds;
        registrationData.guidedLabsInterest = req.body.guidedLabsInterest;
      }

      // Check if email already exists for this registration type
      const existingRegistration = await Registration.findOne({
        email: registrationData.email,
        registrationType: registrationData.registrationType
      });

      if (existingRegistration) {
        return res.status(409).json({
          success: false,
          message: `A registration with this email already exists for ${registrationData.registrationType} type`,
          existingRegistration: {
            id: existingRegistration._id,
            submissionDate: existingRegistration.submissionDate
          }
        });
      }

      // Create new registration
      const registration = new Registration(registrationData);
      await registration.save();

      // Return success response
      res.status(201).json({
        success: true,
        message: 'Registration submitted successfully',
        data: {
          id: registration._id,
          registrationType: registration.registrationType,
          submissionDate: registration.submissionDate
        }
      });

    } catch (error) {
      console.error('Registration creation error:', error);
      
      // Handle duplicate key error
      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message: 'Registration with this information already exists'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error. Please try again later.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get all registrations with filtering and pagination
  async getAllRegistrations(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      // Build filter object
      const filter = {};
      if (req.query.registrationType) {
        filter.registrationType = req.query.registrationType;
      }
      if (req.query.status) {
        filter.status = req.query.status;
      }
      if (req.query.sponsorshipTier) {
        filter.sponsorshipTier = req.query.sponsorshipTier;
      }
      if (req.query.ventureStage) {
        filter.ventureStage = req.query.ventureStage;
      }
      if (req.query.fundingNeeds) {
        filter.fundingNeeds = req.query.fundingNeeds;
      }

      // Date range filtering
      if (req.query.startDate || req.query.endDate) {
        filter.submissionDate = {};
        if (req.query.startDate) {
          filter.submissionDate.$gte = new Date(req.query.startDate);
        }
        if (req.query.endDate) {
          filter.submissionDate.$lte = new Date(req.query.endDate);
        }
      }

      // Search functionality
      if (req.query.search) {
        const searchRegex = new RegExp(req.query.search, 'i');
        filter.$or = [
          { fullName: searchRegex },
          { email: searchRegex },
          { organization: searchRegex },
          { phone: searchRegex },
          { location: searchRegex }
        ];
      }

      // Execute query with pagination
      const registrations = await Registration
        .find(filter)
        .sort({ submissionDate: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      // Get total count for pagination
      const total = await Registration.countDocuments(filter);

      // Calculate pagination info
      const totalPages = Math.ceil(total / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      res.status(200).json({
        success: true,
        data: registrations,
        pagination: {
          currentPage: page,
          totalPages,
          totalRecords: total,
          hasNextPage,
          hasPrevPage,
          limit
        }
      });

    } catch (error) {
      console.error('Get registrations error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch registrations',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get a single registration by ID
  async getRegistrationById(req, res) {
    try {
      const registration = await Registration.findById(req.params.id);

      if (!registration) {
        return res.status(404).json({
          success: false,
          message: 'Registration not found'
        });
      }

      res.status(200).json({
        success: true,
        data: registration
      });

    } catch (error) {
      console.error('Get registration by ID error:', error);
      
      // Handle invalid ObjectId
      if (error.name === 'CastError') {
        return res.status(400).json({
          success: false,
          message: 'Invalid registration ID'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to fetch registration',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Update registration status
  async updateRegistrationStatus(req, res) {
    try {
      const { status } = req.body;
      const allowedStatuses = ['pending', 'reviewed', 'approved', 'rejected'];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status. Allowed values: ' + allowedStatuses.join(', ')
        });
      }

      const registration = await Registration.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      );

      if (!registration) {
        return res.status(404).json({
          success: false,
          message: 'Registration not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Registration status updated successfully',
        data: registration
      });

    } catch (error) {
      console.error('Update registration status error:', error);
      
      if (error.name === 'CastError') {
        return res.status(400).json({
          success: false,
          message: 'Invalid registration ID'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to update registration status',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get registration statistics
  async getRegistrationStats(req, res) {
    try {
      const stats = await Registration.aggregate([
        {
          $group: {
            _id: null,
            totalRegistrations: { $sum: 1 },
            attendees: {
              $sum: { $cond: [{ $eq: ['$registrationType', 'attend'] }, 1, 0] }
            },
            anchorPartners: {
              $sum: { $cond: [{ $eq: ['$registrationType', 'anchor-partner'] }, 1, 0] }
            },
            seriesVentures: {
              $sum: { $cond: [{ $eq: ['$registrationType', 'series-venture'] }, 1, 0] }
            },
            pendingReviews: {
              $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
            },
            approvedRegistrations: {
              $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
            }
          }
        }
      ]);

      // Get registrations by sponsorship tier
      const tierStats = await Registration.aggregate([
        { $match: { registrationType: 'anchor-partner' } },
        {
          $group: {
            _id: '$sponsorshipTier',
            count: { $sum: 1 }
          }
        }
      ]);

      // Get venture stage statistics
      const ventureStageStats = await Registration.aggregate([
        { $match: { registrationType: 'series-venture' } },
        {
          $group: {
            _id: '$ventureStage',
            count: { $sum: 1 }
          }
        }
      ]);

      // Get funding needs statistics
      const fundingStats = await Registration.aggregate([
        { $match: { registrationType: 'series-venture' } },
        {
          $group: {
            _id: '$fundingNeeds',
            count: { $sum: 1 }
          }
        }
      ]);

      // Recent registrations (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const recentCount = await Registration.countDocuments({
        submissionDate: { $gte: sevenDaysAgo }
      });

      res.status(200).json({
        success: true,
        data: {
          overview: stats[0] || {
            totalRegistrations: 0,
            attendees: 0,
            anchorPartners: 0,
            seriesVentures: 0,
            pendingReviews: 0,
            approvedRegistrations: 0
          },
          sponsorshipTiers: tierStats,
          ventureStages: ventureStageStats,
          fundingNeeds: fundingStats,
          recentRegistrations: recentCount
        }
      });

    } catch (error) {
      console.error('Get registration stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch registration statistics',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Delete a registration (permanent/hard delete)
  async deleteRegistration(req, res) {
    try {
      const registration = await Registration.findByIdAndDelete(req.params.id);

      if (!registration) {
        return res.status(404).json({
          success: false,
          message: 'Registration not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Registration permanently deleted successfully',
        data: {
          id: registration._id,
          email: registration.email,
          registrationType: registration.registrationType
        }
      });

    } catch (error) {
      console.error('Delete registration error:', error);
      
      if (error.name === 'CastError') {
        return res.status(400).json({
          success: false,
          message: 'Invalid registration ID'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to delete registration',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = new RegistrationController();