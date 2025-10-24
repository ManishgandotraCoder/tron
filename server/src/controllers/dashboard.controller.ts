import { Request, Response, NextFunction } from 'express';
import { DashboardData, UserPayload } from '../types';
import { ResponseHelper } from '../utils/response.helper';
import { UserService } from '../services/user.service';

export const getDashboardData = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const user = req.user as UserPayload;

        // Get user stats from database
        const stats = await UserService.getUserStats(user.id);

        const dashboardData: DashboardData = {
            user,
            stats: {
                totalLogins: stats.totalLogins,
                lastLogin: stats.lastLogin || new Date()
            }
        };

        ResponseHelper.success(res, 'Dashboard data retrieved successfully', dashboardData);
    } catch (error) {
        next(error);
    }
};

export const getAnalytics = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const user = req.user as UserPayload;

        // Get user stats
        const stats = await UserService.getUserStats(user.id);

        // Mock analytics data (you can replace with real analytics from database)
        const analytics = {
            user: user,
            analytics: {
                weeklyLogins: [2, 4, 3, 5, 7, 6, 8],
                deviceStats: {
                    desktop: 60,
                    mobile: 30,
                    tablet: 10
                },
                locations: [
                    { country: 'USA', count: 45 },
                    { country: 'Canada', count: 20 },
                    { country: 'UK', count: 15 }
                ],
                totalLogins: stats.totalLogins,
                lastLogin: stats.lastLogin
            }
        };

        ResponseHelper.success(res, 'Analytics data retrieved successfully', analytics);
    } catch (error) {
        next(error);
    }
};
