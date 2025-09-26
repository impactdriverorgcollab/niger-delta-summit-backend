const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  // Basic Information
  fullName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    maxlength: 150
  },
  phone: {
    type: String,
    required: true,
    trim: true,
    maxlength: 20
  },
  organization: {
    type: String,
    trim: true,
    maxlength: 200
  },
  
  // Registration Type
  registrationType: {
    type: String,
    required: true,
    enum: ['anchor-partner', 'series-venture', 'attend'],
    default: 'attend'
  },
  
  // Anchor Partner specific fields
  sponsorshipTier: {
    type: String,
    enum: ['tier1', 'tier2', 'community', 'demoday', ''],
    default: ''
  },
  participationType: {
    type: String,
    enum: ['sponsor', 'speaker', 'exhibitor', 'multiple', ''],
    default: ''
  },
  
  // Series Venture specific fields
  projectDescription: {
    type: String,
    maxlength: 1000,
    default: ''
  },
  
  // Metadata
  submissionDate: {
    type: Date,
    default: Date.now
  },
  ipAddress: {
    type: String,
    trim: true
  },
  userAgent: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'approved', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Index for faster queries
registrationSchema.index({ email: 1 });
registrationSchema.index({ registrationType: 1 });
registrationSchema.index({ submissionDate: -1 });

// Virtual for formatted registration type
registrationSchema.virtual('registrationTypeFormatted').get(function() {
  const typeMap = {
    'anchor-partner': 'Anchor Partner',
    'series-venture': 'Series Venture',
    'attend': 'Attendee'
  };
  return typeMap[this.registrationType] || this.registrationType;
});

// Method to get sponsorship tier description
registrationSchema.methods.getSponsorshipTierDescription = function() {
  const tierMap = {
    'tier1': 'Anchor Partner Tier 1 (₦40m+ / $26.6k+)',
    'tier2': 'Anchor Partner Tier 2 (₦25m-40m / $16.6k-26.6k)',
    'community': 'Community Sponsor (₦10m-25m / $6.6k-16.6k)',
    'demoday': 'Demo Day Sponsor (₦5m-10m / $3k-6.6k)'
  };
  return tierMap[this.sponsorshipTier] || '';
};

module.exports = mongoose.model('Registration', registrationSchema);