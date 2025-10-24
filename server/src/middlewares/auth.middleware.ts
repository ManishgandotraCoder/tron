import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserPayload } from '../types';

export const authenticateToken = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        res.status(401).json({
            success: false,
            message: 'Access token required'
        });
        return;
    }

    try {
        const secret = process.env.JWT_SECRET || 'your-secret-key';
        const decoded = jwt.verify(token, secret) as UserPayload;
        req.user = decoded;
        next();
    } catch (error) {
        res.status(403).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }
};

export const setSecurityHeaders = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    // Prevent caching of sensitive responses
    res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate, private',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'no-referrer',
        'Content-Security-Policy': "default-src 'self'"
    });

    next();
};

export const clearSessionMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    // Add custom headers to instruct client to clear all storage
    res.set({
        'Clear-Site-Data': '"cache", "cookies", "storage", "executionContexts"',
        'X-Logout-Complete': 'true'
    });

    next();
};
