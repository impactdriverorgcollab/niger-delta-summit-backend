# Niger Delta Climate Summit Backend API

A Node.js backend API for handling registration forms for the Niger Delta Climate & Technology Series 2025. Built with Express.js, MongoDB, and Zoho Mail integration.

## Features

- ✅ Registration form submission with validation
- ✅ Email notifications (confirmation + admin alerts)
- ✅ Registration retrieval with filtering and pagination
- ✅ Registration statistics and analytics
- ✅ Rate limiting and security middleware
- ✅ Input sanitization and validation
- ✅ MongoDB integration with Mongoose
- ✅ Zoho Mail integration for email notifications
- ✅ No authentication required (as requested)

## Project Structure

```
├── config/
│   └── database.js          # MongoDB connection configuration
├── controllers/
│   └── registrationController.js  # Registration business logic
├── middleware/
│   ├── security.js          # Rate limiting, sanitization, security headers
│   └── validation.js        # Input validation rules
├── models/
│   └── Registration.js      # MongoDB schema and model
├── routes/
│   └── registrations.js     # API route definitions
├── services/
│   └── emailService.js      # Zoho Mail email service
├── .env.example             # Environment variables template
├── package.json             # Dependencies and scripts
├── server.js                # Main application entry point
└── README.md                # This file
```

## Installation & Setup

### 1. Clone and Install Dependencies

```bash
# Clone the repository (or create the files manually)
git clone <repository-url>
cd niger-delta-climate-summit-backend

# Install dependencies
npm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env` and configure your settings:

```bash
cp .env.example .env
```

Edit `.env` file with your settings:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/niger-delta-summit

# Zoho Mail Configuration
ZOHO_MAIL_HOST=smtp.zoho.com
ZOHO_MAIL_PORT=587
ZOHO_MAIL_USER=uduak@impactdriver.org
ZOHO_MAIL_PASS=your_zoho_app_password_here

# API Configuration
API_BASE_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3000

# Security
CORS_ORIGIN=http://localhost:3000,https://yourdomain.com
```

### 3. Database Setup

Ensure MongoDB is running:

**Local MongoDB:**
```bash
# Install MongoDB (Ubuntu/Debian)
sudo apt-get install mongodb

# Start MongoDB service
sudo systemctl start mongodb
```

**MongoDB Atlas (Cloud):**
- Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Create a cluster and get connection string
- Update `MONGODB_URI` in `.env`

### 4. Zoho Mail Setup

1. **Enable 2FA** on your Zoho account
2. **Generate App Password:**
   - Go to Zoho Account Settings → Security → App Passwords
   - Generate a new app password for "Mail"
   - Use this password in `ZOHO_MAIL_PASS` (not your regular password)

### 5. Start the Server

```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints

### Core Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/registrations` | Create new registration |
| `GET` | `/api/registrations` | Get all registrations (with filtering) |
| `GET` | `/api/registrations/stats` | Get registration statistics |
| `GET` | `/api/registrations/:id` | Get single registration by ID |
| `PUT` | `/api/registrations/:id/status` | Update registration status |
| `DELETE` | `/api/registrations/:id` | Delete registration (soft delete) |

### Utility Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `GET` | `/api` | API documentation |

## API Usage Examples

### 1. Create Registration

```bash
curl -X POST http://localhost:3000/api/registrations \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "+2348012345678",
    "organization": "Example Corp",
    "registrationType": "attend"
  }'
```

### 2. Get All Registrations

```bash
# Basic request
curl http://localhost:3000/api/registrations

# With filtering and pagination
curl "http://localhost:3000/api/registrations?page=1&limit=10&registrationType=anchor-partner&status=pending"

# With search
curl "http://localhost:3000/api/registrations?search=john&page=1"
```

### 3. Get Registration Statistics

```bash
curl http://localhost:3000/api/registrations/stats
```

### 4. Update Registration Status

```bash
curl -X PUT http://localhost:3000/api/registrations/REGISTRATION_ID/status \
  -H "Content-Type: application/json" \
  -d '{"status": "approved"}'
```

## Registration Types & Validation

### Registration Types

1. **`attend`** - Regular attendee
   - Required: `fullName`, `email`, `phone`
   - Optional: `organization`

2. **`anchor-partner`** - Sponsor/Partner
   - Required: All basic fields + `sponsorshipTier`, `participationType`
   - Sponsorship tiers: `tier1`, `tier2`, `community`, `demoday`
   - Participation types: `sponsor`, `speaker`, `exhibitor`, `multiple`

3. **`series-venture`** - Venture/Project participant
   - Required: All basic fields + `projectDescription`
   - Project description: 50-1000 characters

### Query Parameters for GET /api/registrations

| Parameter | Description | Example |
|-----------|-------------|---------|
| `page` | Page number (default: 1) | `?page=2` |
| `limit` | Records per page (default: 10, max: 100) | `?limit=20` |
| `registrationType` | Filter by type | `?registrationType=anchor-partner` |
| `status` | Filter by status | `?status=pending` |
| `sponsorshipTier` | Filter by sponsor tier | `?sponsorshipTier=tier1` |
| `startDate` | Start date filter (YYYY-MM-DD) | `?startDate=2025-01-01` |
| `endDate` | End date filter (YYYY-MM-DD) | `?endDate=2025-12-31` |
| `search` | Search in multiple fields | `?search=john` |

## Email Notifications

The system automatically sends:

1. **Confirmation Email** to registrant
   - Personalized with registration details
   - Event information and next steps
   - Contact information

2. **Admin Notification** to `uduak@impactdriver.org`
   - Complete registration details
   - Admin action suggestions
   - System metadata

## Security Features

- **Rate Limiting:** 5 registrations per IP per 15 minutes
- **Input Sanitization:** Removes potentially dangerous content
- **Data Validation:** Comprehensive validation with error messages
- **Security Headers:** Helmet.js for secure HTTP headers
- **CORS Protection:** Configurable allowed origins
- **Request Logging:** All requests logged with timing

## Production Deployment

### Environment Variables for Production

```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/niger-delta-summit
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
```

### Process Management

Use PM2 for production process management:

```bash
npm install -g pm2

# Start application
pm2 start server.js --name "climate-summit-api"

# Monitor
pm2 status
pm2 logs climate-summit-api

# Restart
pm2 restart climate-summit-api
```

### Nginx Reverse Proxy (Optional)

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Database Collections

### Registrations Collection

The system creates a `registrations` collection with the following structure:

```javascript
{
  _id: ObjectId,
  fullName: String,
  email: String,
  phone: String,
  organization: String,
  registrationType: String, // 'anchor-partner', 'series-venture', 'attend'
  sponsorshipTier: String,  // Only for anchor-partner
  participationType: String, // Only for anchor-partner
  projectDescription: String, // Only for series-venture
  submissionDate: Date,
  ipAddress: String,
  userAgent: String,
  status: String, // 'pending', 'reviewed', 'approved', 'rejected'
  createdAt: Date,
  updatedAt: Date
}
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   ```
   Error: ECONNREFUSED mongodb://localhost:27017
   ```
   - Ensure MongoDB is running
   - Check connection string in `.env`
   - For Atlas: Ensure IP is whitelisted

2. **Email Sending Failed**
   ```
   Error: Invalid login: 535 Authentication failed
   ```
   - Verify Zoho app password (not regular password)
   - Enable 2FA on Zoho account
   - Check SMTP settings

3. **CORS Errors**
   ```
   Access to fetch blocked by CORS policy
   ```
   - Add your frontend URL to `CORS_ORIGIN` in `.env`
   - Ensure the origin matches exactly (including protocol)

4. **Rate Limiting Issues**
   ```
   Too many registration attempts
   ```
   - Wait 15 minutes between attempts from same IP
   - Adjust rate limits in `middleware/security.js` if needed

### Debug Mode

Enable detailed logging:

```env
NODE_ENV=development
```

This will show:
- Full error stack traces
- Detailed request/response logs
- Database query logs

## Testing the API

### Using curl

Test health endpoint:
```bash
curl http://localhost:3000/health
```

Test registration creation:
```bash
curl -X POST http://localhost:3000/api/registrations \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test@example.com",
    "phone": "+2348012345678",
    "registrationType": "attend"
  }'
```

### Using Postman

Import this collection URL: `http://localhost:3000/api` to see all available endpoints with documentation.

### Frontend Integration

Update your React form submission to use the new backend:

```javascript
const handleSubmit = async (formData) => {
  try {
    const response = await fetch('http://localhost:3000/api/registrations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    });

    const result = await response.json();
    
    if (result.success) {
      alert('Registration submitted successfully!');
      setShowForm(false);
    } else {
      alert(result.message || 'Registration failed');
    }
  } catch (error) {
    console.error('Registration error:', error);
    alert('Network error. Please try again.');
  }
};
```

## Contributing

1. Follow the existing code structure and naming conventions
2. Add validation for any new fields
3. Update email templates when adding new registration types
4. Test thoroughly with different input scenarios
5. Update documentation for any API changes

## License

This project is licensed under the ISC License.

## Support

For technical support:
- Email: uduak@impactdriver.org
- Organization: Impact Driver Nigeria

## Changelog

### v1.0.0 (Current)
- Initial release
- Registration form handling
- Email notifications
- Statistics and filtering
- Rate limiting and security
- MongoDB integration
- Zoho Mail integration