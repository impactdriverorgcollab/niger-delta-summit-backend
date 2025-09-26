const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const connectDatabase = require('./config/database');
const registrationRoutes = require('./routes/registrations');
const emailService = require('./services/emailService');
const { generalRateLimit, securityHeaders, requestLogger } = require('./middleware/security');



// Initialize Express app
const app = express();

// Connect to database
connectDatabase();

// Verify email service on startup
emailService.verifyConnection().then(isReady => {
  if (!isReady) {
    console.warn('⚠️  Email service is not properly configured. Emails will fail to send.');
  }
});

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  }
}));

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = process.env.CORS_ORIGIN ? 
      process.env.CORS_ORIGIN.split(',').map(origin => origin.trim()) : 
      ['http://localhost:3000', 'http://localhost:3001'];
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Custom security headers
app.use(securityHeaders);

// Request logging
app.use(requestLogger);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// General rate limiting
app.use('/api/', generalRateLimit);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Niger Delta Climate Summit API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Documentation endpoint
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Niger Delta Climate & Technology Series 2025 API',
    version: '1.0.0',
    endpoints: {
      registrations: {
        'POST /api/registrations': 'Create a new registration',
        'GET /api/registrations': 'Get all registrations with filtering and pagination',
        'GET /api/registrations/stats': 'Get registration statistics',
        'GET /api/registrations/:id': 'Get a single registration by ID',
        'PUT /api/registrations/:id/status': 'Update registration status',
        'DELETE /api/registrations/:id': 'Delete a registration (soft delete)'
      },
      health: {
        'GET /health': 'Health check endpoint'
      }
    },
    queryParameters: {
      'GET /api/registrations': {
        page: 'Page number for pagination (default: 1)',
        limit: 'Number of records per page (default: 10, max: 100)',
        registrationType: 'Filter by registration type (anchor-partner, series-venture, attend)',
        status: 'Filter by status (pending, reviewed, approved, rejected)',
        sponsorshipTier: 'Filter by sponsorship tier (tier1, tier2, community, demoday)',
        startDate: 'Filter by start date (YYYY-MM-DD)',
        endDate: 'Filter by end date (YYYY-MM-DD)',
        search: 'Search in name, email, organization, or phone'
      }
    },
    contact: {
      email: 'uduak@impactdriver.org',
      organization: 'Impact Driver Nigeria'
    }
  });
});

// API routes
app.use('/api/registrations', registrationRoutes);

// 404 handler for undefined routes
app.use('/{*notFound}', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    availableEndpoints: {
      health: 'GET /health',
      api_docs: 'GET /api',
      registrations: 'GET /api/registrations'
    }
  });
});

// Global error handling middleware
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  
  // CORS errors
  if (error.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      message: 'CORS policy violation. Origin not allowed.'
    });
  }
  
  // JSON parsing errors
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON in request body'
    });
  }
  
  // Request entity too large
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      message: 'Request entity too large'
    });
  }
  
  // Default error response
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// Server startup
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log('\n🚀 Niger Delta Climate Summit API Server Started');
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Database: ${process.env.MONGODB_URI ? 'Connected' : 'Not configured'}`);
  console.log(`📧 Email Service: ${process.env.ZOHO_MAIL_USER ? 'Configured' : 'Not configured'}`);
  console.log('\n📚 API Documentation: http://localhost:' + PORT + '/api');
  console.log('🏥 Health Check: http://localhost:' + PORT + '/health');
  console.log('\n⚡ Ready to accept registrations!\n');
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
  console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
  
  server.close(() => {
    console.log('✅ HTTP server closed');
    
    // Close database connection
    require('mongoose').connection.close(() => {
      console.log('✅ Database connection closed');
      process.exit(0);
    });
  });
  
  // Force close after 10 seconds
  setTimeout(() => {
    console.log('⚠️  Force closing server');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

module.exports = app;