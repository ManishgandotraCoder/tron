import { Response } from 'express';

export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    errors?: any[];
    statusCode: number;
}

export class ResponseHelper {
    /**
     * Send success response
     */
    static success<T>(
        res: Response,
        message: string = 'Success',
        data?: T,
        statusCode: number = 200
    ): Response {
        const response: ApiResponse<T> = {
            success: true,
            message,
            statusCode,
            ...(data && { data })
        };

        return res.status(statusCode).json(response);
    }

    /**
     * Send error response
     */
    static error(
        res: Response,
        message: string = 'Internal Server Error',
        errors?: any[],
        statusCode: number = 500
    ): Response {
        const response: ApiResponse = {
            success: false,
            message,
            statusCode,
            ...(errors && { errors })
        };

        return res.status(statusCode).json(response);
    }

    /**
     * Send validation error response
     */
    static validationError(
        res: Response,
        errors: any[],
        message: string = 'Validation Error'
    ): Response {
        return this.error(res, message, errors, 400);
    }

    /**
     * Send unauthorized response
     */
    static unauthorized(
        res: Response,
        message: string = 'Unauthorized'
    ): Response {
        return this.error(res, message, undefined, 401);
    }

    /**
     * Send forbidden response
     */
    static forbidden(
        res: Response,
        message: string = 'Forbidden'
    ): Response {
        return this.error(res, message, undefined, 403);
    }

    /**
     * Send not found response
     */
    static notFound(
        res: Response,
        message: string = 'Resource not found'
    ): Response {
        return this.error(res, message, undefined, 404);
    }

    /**
     * Send conflict response
     */
    static conflict(
        res: Response,
        message: string = 'Conflict'
    ): Response {
        return this.error(res, message, undefined, 409);
    }

    /**
     * Send created response
     */
    static created<T>(
        res: Response,
        message: string = 'Resource created successfully',
        data?: T
    ): Response {
        return this.success(res, message, data, 201);
    }
}
