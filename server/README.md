# Authenticator Server

A Node.js/Express.js server with JWT authentication, Passport.js integration, MongoDB database, and modular routing architecture.

## Features

- **Express.js** server with TypeScript
- **MongoDB** with Mongoose ODM
- **JWT** authentication
- **PIN-based authentication** with time-based expiry and attempt limiting
- **Passport.js** for local and JWT strategies
- **Modular routing** (User and Dashboard modules)
- **Express Validator** for input validation
- **bcryptjs** for password and PIN hashing
- **CORS** support
- **Error handling** middleware
- **Response helpers** for consistent API responses
- **Service layer** for business logic
- **Security features**: PIN lockout after 3 failed attempts, 10-minute PIN expiry
- **Avatar generation** with OpenAI DALL-E integration

## Architecture

```
src/
├── server.ts              # Main server file
├── config/
│   ├── passport.config.ts # Passport strategies configuration
│   └── database.config.ts # MongoDB connection configuration
├── controllers/
│   ├── user.controller.ts     # User authentication controllers
│   ├── dashboard.controller.ts # Dashboard data controllers
│   └── avatar.controller.ts    # Avatar generation controllers
├── middlewares/
│   ├── auth.middleware.ts      # JWT authentication middleware
│   ├── error.middleware.ts     # Global error handler
│   └── validation.middleware.ts # Validation error handler
├── models/
│   └── User.model.ts          # MongoDB User model
├── routes/
│   ├── user.routes.ts         # User authentication routes
│   ├── dashboard.routes.ts    # Dashboard routes
│   └── avatar.routes.ts       # Avatar generation routes
├── services/
│   └── user.service.ts        # User business logic
├── types/
│   ├── index.ts              # Application types
│   └── express.d.ts          # Express type extensions
├── utils/
│   └── response.helper.ts    # Response helper utilities
└── validators/
    └── auth.validator.ts     # Input validation schemas
```

## Installation

```bash
npm install
```

## Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/authenticator
OPENAI_API_KEY=your-openai-api-key-for-avatar-generation
```

## MongoDB Setup

1. Install MongoDB locally or use MongoDB Atlas
2. Make sure MongoDB is running on `mongodb://localhost:27017`
3. The database `authenticator` will be created automatically

## Available Scripts

```bash
# Development
npm run dev

# Build
npm run build

# Production
npm start

# Watch mode with nodemon
npm run server
```

## PIN Authentication Flow

The application uses a secure PIN-based authentication system instead of traditional password login:

1. **PIN Generation**: Users request a PIN by providing their email address
   - A 6-digit numeric PIN is generated and stored (hashed)
   - PIN expires after 10 minutes
   - PIN attempts counter is reset

2. **PIN Verification**: Users authenticate by providing email and PIN
   - PIN is validated against the stored hash
   - Successful verification returns a JWT token
   - Failed attempts are tracked (max 3 attempts)
   - After 3 failed attempts, PIN verification is locked for 15 minutes

3. **Security Features**:
   - PINs are hashed using bcrypt before storage
   - Time-based expiry (10 minutes)
   - Attempt limiting with temporary lockout
   - PIN is cleared after successful verification

## API Endpoints

### Authentication Routes (`/api/user`)

- `POST /api/user/register` - Register a new user
- `POST /api/user/generate-pin` - Generate a 6-digit PIN for authentication
- `POST /api/user/verify-pin` - Verify PIN and authenticate user
- `GET /api/user/profile` - Get user profile (protected)
- `PUT /api/user/profile` - Update user profile (protected)
- `GET /api/user/all` - Get all users with pagination (protected)

### Dashboard Routes (`/api/dashboard`)

- `GET /api/dashboard/` - Get dashboard data (protected)
- `GET /api/dashboard/analytics` - Get analytics data (protected)

### Avatar Generation Routes (`/api`)

- `POST /api/generate-avatar` - Generate AI avatar (protected)

### Health Check

- `GET /health` - Server health check

## Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "message": "Success message",
  "statusCode": 200,
  "data": {
    // Response data
  }
}
```

Error responses:

```json
{
  "success": false,
  "message": "Error message",
  "statusCode": 400,
  "errors": [
    // Error details (for validation errors)
  ]
}
```

## Usage Examples

### Register a new user
```bash
curl -X POST http://localhost:3000/api/user/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Password123",
    "name": "John Doe"
  }'
```

### Generate PIN
```bash
curl -X POST http://localhost:3000/api/user/generate-pin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com"
  }'
```

### Verify PIN
```bash
curl -X POST http://localhost:3000/api/user/verify-pin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "pin": "123456"
  }'
```

### Update profile
```bash
curl -X PUT http://localhost:3000/api/user/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Jane Smith"
  }'
```

### Access protected route
```bash
curl -X GET http://localhost:3000/api/dashboard/ \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Generate AI Avatar
```bash
curl -X POST http://localhost:3000/api/generate-avatar \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "gender": "female",
    "skinTone": "medium-warm",
    "size": "1024x1792"
  }'
```

## Database Schema

### User Model

```typescript
{
  email: string;        // Required, unique, lowercase
  password: string;     // Required, hashed with bcrypt
  name: string;    // Required, 2-50 characters
  lastLogin: Date;      // Optional, tracks last login time
  loginCount: number;   // Default: 0, incremented on each login
  isActive: boolean;    // Default: true, for soft delete
  pin: string;          // Optional, hashed 6-digit PIN for authentication
  pinExpiry: Date;      // Optional, PIN expiration time (10 minutes)
  pinAttempts: number;  // Default: 0, tracks failed PIN attempts
  pinLockedUntil: Date; // Optional, PIN lock expiry (15 minutes after 3 failures)
  createdAt: Date;      // Auto-generated
  updatedAt: Date;      // Auto-generated
}
```

## Technologies Used

- Node.js
- Express.js
- TypeScript
- MongoDB
- Mongoose
- JWT (jsonwebtoken)
- Passport.js
- bcryptjs
- express-validator
- CORS
- body-parser
- dotenv

## Response Helper Methods

The `ResponseHelper` class provides consistent API responses:

- `ResponseHelper.success()` - Success response (200)
- `ResponseHelper.created()` - Created response (201)
- `ResponseHelper.error()` - Error response (500)
- `ResponseHelper.validationError()` - Validation error (400)
- `ResponseHelper.unauthorized()` - Unauthorized (401)
- `ResponseHelper.forbidden()` - Forbidden (403)
- `ResponseHelper.notFound()` - Not found (404)
- `ResponseHelper.conflict()` - Conflict (409)
