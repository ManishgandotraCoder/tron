import { Router } from 'express';
import { getDashboardData, getAnalytics } from '../controllers/dashboard.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

export const dashboardRouter = Router();

// All dashboard routes are protected
dashboardRouter.use(authenticateToken);

/**
 * @swagger
 * /api/dashboard:
 *   get:
 *     summary: Get dashboard data
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/DashboardData'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
dashboardRouter.get('/', getDashboardData);

/**
 * @swagger
 * /api/dashboard/analytics:
 *   get:
 *     summary: Get analytics data
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         user:
 *                           $ref: '#/components/schemas/User'
 *                         analytics:
 *                           type: object
 *                           properties:
 *                             weeklyLogins:
 *                               type: array
 *                               items:
 *                                 type: number
 *                               description: Login counts for each day of the week
 *                               example: [2, 4, 3, 5, 7, 6, 8]
 *                             deviceStats:
 *                               type: object
 *                               properties:
 *                                 desktop:
 *                                   type: number
 *                                   description: Percentage of desktop usage
 *                                 mobile:
 *                                   type: number
 *                                   description: Percentage of mobile usage
 *                                 tablet:
 *                                   type: number
 *                                   description: Percentage of tablet usage
 *                               example:
 *                                 desktop: 60
 *                                 mobile: 30
 *                                 tablet: 10
 *                             locations:
 *                               type: array
 *                               items:
 *                                 type: object
 *                                 properties:
 *                                   country:
 *                                     type: string
 *                                     description: Country name
 *                                   count:
 *                                     type: number
 *                                     description: Login count from this country
 *                               example:
 *                                 - country: "USA"
 *                                   count: 45
 *                                 - country: "Canada"
 *                                   count: 20
 *                             totalLogins:
 *                               type: number
 *                               description: Total number of user logins
 *                             lastLogin:
 *                               type: string
 *                               format: date-time
 *                               description: Last login timestamp
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
dashboardRouter.get('/analytics', getAnalytics);
