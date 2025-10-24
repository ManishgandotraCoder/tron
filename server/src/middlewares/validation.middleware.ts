import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { CustomError } from './error.middleware';

export const handleValidationErrors = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const error: CustomError = new Error('Validation failed');
        error.statusCode = 400;
        error.errors = errors.array();
        return next(error);
    }

    next();
};
