import { Request, Response, NextFunction } from 'express';
import { ValidationError } from 'express-validator';
import { ResponseHelper } from '../utils/response.helper';

export interface CustomError extends Error {
    statusCode?: number;
    errors?: ValidationError[];
}

export const errorHandler = (
    err: CustomError,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';

    // Handle validation errors
    if (err.errors && Array.isArray(err.errors)) {
        ResponseHelper.validationError(res, err.errors);
        return;
    }

    // Handle JWT errors
    if (err.name === 'JsonWebTokenError') {
        ResponseHelper.unauthorized(res, 'Invalid token');
        return;
    } else if (err.name === 'TokenExpiredError') {
        ResponseHelper.unauthorized(res, 'Token expired');
        return;
    }

    // Handle MongoDB errors
    if (err.name === 'ValidationError') {
        ResponseHelper.validationError(res, [], 'Database validation error');
        return;
    }

    if (err.name === 'CastError') {
        ResponseHelper.error(res, 'Invalid ID format', undefined, 400);
        return;
    }

    // Handle duplicate key error (MongoDB)
    if ((err as any).code === 11000) {
        ResponseHelper.conflict(res, 'Resource already exists');
        return;
    }

    console.error('Error:', err);

    ResponseHelper.error(
        res,
        message,
        process.env.NODE_ENV === 'development' ? [err.stack] : undefined,
        statusCode
    );
};