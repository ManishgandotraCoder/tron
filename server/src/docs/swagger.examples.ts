/**
 * @swagger
 * tags:
 *   - name: Authentication
 *     description: User authentication endpoints (register, login)
 *   - name: User Management
 *     description: User profile and management endpoints
 *   - name: Dashboard
 *     description: Dashboard and analytics endpoints
 *   - name: System
 *     description: System health and status endpoints
 */

/**
 * @swagger
 * components:
 *   examples:
 *     UserExample:
 *       summary: Sample user object
 *       value:
 *         id: "64f5a1b2c3d4e5f6a7b8c9d0"
 *         email: "john.doe@example.com"
 *        name: "John Doe"
 *     
 *     RegisterExample:
 *       summary: Sample registration request
 *       value:
 *         email: "user@example.com"
 *         password: "Password123"
 *         name: "John Doe"
 *     
 *     LoginExample:
 *       summary: Sample login request
 *       value:
 *         email: "user@example.com"
 *         password: "Password123"
 *     
 *     AuthSuccessExample:
 *       summary: Successful authentication response
 *       value:
 *         success: true
 *         message: "Login successful"
 *         statusCode: 200
 *         data:
 *           token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *           user:
 *             id: "64f5a1b2c3d4e5f6a7b8c9d0"
 *             email: "user@example.com"
       name: "John Doe"
 *     
 *     ValidationErrorExample:
 *       summary: Validation error response
 *       value:
 *         success: false
 *         message: "Validation Error"
 *         statusCode: 400
 *         errors:
 *           - field: "email"
 *             message: "Please provide a valid email"
 *           - field: "password"
 *             message: "Password must be at least 6 characters long"
 *     
 *     UnauthorizedExample:
 *       summary: Unauthorized error response
 *       value:
 *         success: false
 *         message: "Unauthorized"
 *         statusCode: 401
 */
