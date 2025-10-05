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
  ventureStage: {
    type: String,
    enum: ['idea', 'prototype', 'pilot', 'early-revenue', 'scaling', ''],
    default: ''
  },
  location: {
    type: String,
    trim: true,
    maxlength: 200,
    default: ''
  },
  teamSize: {
    type: Number,
    min: 1,
    default: null
  },
  projectDescription: {
    type: String,
    minlength: 100,
    maxlength: 500,
    default: ''
  },
  fundingNeeds: {
    type: String,
    enum: ['under-5m', '5m-10m', '10m-25m', '25m-50m', 'over-50m', ''],
    default: ''
  },
  guidedLabsInterest: {
    type: String,
    minlength: 50,
    maxlength: 500,
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

// Indexes for faster queries
registrationSchema.index({ email: 1 });
registrationSchema.index({ registrationType: 1 });
registrationSchema.index({ submissionDate: -1 });
registrationSchema.index({ ventureStage: 1 });
registrationSchema.index({ fundingNeeds: 1 });

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

// Method to get venture stage description
registrationSchema.methods.getVentureStageDescription = function() {
  const stageMap = {
    'idea': 'Idea Stage',
    'prototype': 'Prototype/MVP',
    'pilot': 'Pilot/Testing',
    'early-revenue': 'Early Revenue',
    'scaling': 'Scaling'
  };
  return stageMap[this.ventureStage] || '';
};

// Method to get funding needs description
registrationSchema.methods.getFundingNeedsDescription = function() {
  const fundingMap = {
    'under-5m': 'Under ₦5M',
    '5m-10m': '₦5M - ₦10M',
    '10m-25m': '₦10M - ₦25M',
    '25m-50m': '₦25M - ₦50M',
    'over-50m': 'Over ₦50M'
  };
  return fundingMap[this.fundingNeeds] || '';
};

module.exports = mongoose.model('Registration', registrationSchema);