#!/usr/bin/env node
require('dotenv').config()
const fs = require('fs');
const path = require('path');


// ASCII Art for startup
const banner = `
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   Niger Delta Climate & Technology Series 2025               ║
║   Backend API Server                                          ║
║                                                               ║
║   Powered by Impact Driver Nigeria                           ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
`;

console.log('\x1b[36m%s\x1b[0m', banner);

// Check if .env file exists
const envPath = path.join(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
  console.log('\x1b[33m%s\x1b[0m', '⚠️  Warning: .env file not found!');
  console.log('\x1b[33m%s\x1b[0m', '   Please copy .env.example to .env and configure your settings.');
  console.log('\x1b[33m%s\x1b[0m', '   Command: cp .env.example .env\n');
}

// Pre-flight checks
const requiredEnvVars = [
  'MONGODB_URI',
  'ZOHO_MAIL_USER',
  'ZOHO_MAIL_PASS'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.log('\x1b[31m%s\x1b[0m', '❌ Missing required environment variables:');
  missingVars.forEach(varName => {
    console.log('\x1b[31m%s\x1b[0m', `   - ${varName}`);
  });
  console.log('\x1b[33m%s\x1b[0m', '\n   Please configure these in your .env file before starting.\n');
  process.exit(1);
}

// Check MongoDB URI format
const mongoUri = process.env.MONGODB_URI;
if (mongoUri && !mongoUri.startsWith('mongodb://') && !mongoUri.startsWith('mongodb+srv://')) {
  console.log('\x1b[31m%s\x1b[0m', '❌ Invalid MongoDB URI format in MONGODB_URI');
  console.log('\x1b[33m%s\x1b[0m', '   Should start with mongodb:// or mongodb+srv://\n');
  process.exit(1);
}

// All checks passed, start the server
console.log('\x1b[32m%s\x1b[0m', '✅ Pre-flight checks passed!');
console.log('\x1b[36m%s\x1b[0m', '🚀 Starting server...\n');

// Import and start the main server
require('../server');