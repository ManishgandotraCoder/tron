import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { LoginRequest, RegisterRequest, GeneratePinRequest, VerifyPinRequest, AuthResponse, UserPayload, PinResponse } from '../types';
import { ResponseHelper } from '../utils/response.helper';
import { UserService } from '../services/user.service';

const generateToken = (user: UserPayload): string => {
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    return jwt.sign(user, secret, { expiresIn: '24h' });
};

export const register = async (
    req: Request<{}, any, RegisterRequest>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            ResponseHelper.validationError(res, errors.array());
            return;
        }

        const { email, password, name } = req.body;

        // Check if user already exists
        const existingUser = await UserService.findByEmail(email);
        if (existingUser) {
            ResponseHelper.conflict(res, 'User already exists with this email');
            return;
        }

        // Create new user
        const newUser = await UserService.createUser({
            email,
            password,
            name
        });

        // Create user payload (without password)
        const userPayload: UserPayload = newUser.toUserPayload();

        // Generate token
        const token = generateToken(userPayload);

        const authResponse: AuthResponse = {
            token,
            user: userPayload
        };

        ResponseHelper.created(res, 'User registered successfully', authResponse);
    } catch (error) {
        next(error);
    }
};

export const login = async (
    req: Request<{}, any, LoginRequest>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            ResponseHelper.validationError(res, errors.array());
            return;
        }

        // Use passport local strategy
        passport.authenticate('local', { session: false }, (err: any, user: UserPayload | false, info: any) => {
            if (err) {
                return next(err);
            }

            if (!user) {
                ResponseHelper.unauthorized(res, info?.message || 'Invalid credentials');
                return;
            }

            // Generate token
            const token = generateToken(user);

            const authResponse: AuthResponse = {
                token,
                user
            };

            ResponseHelper.success(res, 'Login successful', authResponse);
        })(req, res, next);
    } catch (error) {
        next(error);
    }
};

export const getProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // User is attached by auth middleware
        const user = req.user as UserPayload;

        ResponseHelper.success(res, 'Profile retrieved successfully', { user });
    } catch (error) {
        next(error);
    }
};

export const updateProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const user = req.user as UserPayload;
        const { name } = req.body;

        // Validate input
        if (!name) {
            ResponseHelper.error(res, 'Name is required', undefined, 400);
            return;
        }

        const updateData: any = {};
        if (name) updateData.name = name;

        const updatedUser = await UserService.updateProfile(user.id, updateData);

        if (!updatedUser) {
            ResponseHelper.notFound(res, 'User not found');
            return;
        }

        const userPayload: UserPayload = updatedUser.toUserPayload();
        ResponseHelper.success(res, 'Profile updated successfully', { user: userPayload });
    } catch (error) {
        next(error);
    }
};

export const generatePin = async (
    req: Request<{}, any, GeneratePinRequest>,
    res: Response,
    next: NextFunction
): Promise<void> => {

    try {
        // Check for validation errors
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            ResponseHelper.validationError(res, errors.array());
            return;
        }

        const { email } = req.body;

        // Find user by email
        const user = await UserService.findByEmail(email);

        if (!user) {
            ResponseHelper.notFound(res, 'User not found with this email');
            return;
        }

        // Check if user is active
        if (!user.isActive) {
            ResponseHelper.forbidden(res, 'Account is deactivated');
            return;
        }

        // Check if PIN is currently locked
        if (user.isPinLocked()) {
            const lockTimeRemaining = Math.ceil((user.pinLockedUntil!.getTime() - new Date().getTime()) / (1000 * 60));
            ResponseHelper.error(res, `PIN generation is locked. Try again in ${lockTimeRemaining} minutes.`, undefined, 429);
            return;
        }
        console.log("PIN generation not locked.");

        // Generate new PIN
        const pin = await user.generatePin();
        console.log("PIN generated:", pin);

        // In a real application, you would send this PIN via SMS/Email
        // For demo purposes, we'll return it in the response
        console.log(`Generated PIN for ${email}: ${pin}`);

        const pinResponse: PinResponse = {
            message: 'PIN generated successfully. Check your email/SMS for the PIN.',
            expiresIn: 10, // 10 minutes
            // For demo purposes only - remove in production
            demoPin: pin
        };

        ResponseHelper.success(res, 'PIN generated successfully', pinResponse);
    } catch (error) {
        next(error);
    }
};

export const verifyPin = async (
    req: Request<{}, any, VerifyPinRequest>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            ResponseHelper.validationError(res, errors.array());
            return;
        }

        const { email, pin } = req.body;

        // Find user by email
        const user = await UserService.findByEmail(email);
        if (!user) {
            ResponseHelper.notFound(res, 'User not found with this email');
            return;
        }

        // Check if user is active
        if (!user.isActive) {
            ResponseHelper.forbidden(res, 'Account is deactivated');
            return;
        }

        // Check if PIN is currently locked
        if (user.isPinLocked()) {
            const lockTimeRemaining = Math.ceil((user.pinLockedUntil!.getTime() - new Date().getTime()) / (1000 * 60));
            ResponseHelper.error(res, `PIN verification is locked. Try again in ${lockTimeRemaining} minutes.`, undefined, 429);
            return;
        }

        // Check if PIN exists
        if (!user.pin) {
            ResponseHelper.error(res, 'No PIN found. Please generate a PIN first.', undefined, 400);
            return;
        }

        // Check if PIN is expired
        if (user.isPinExpired()) {
            ResponseHelper.error(res, 'PIN has expired. Please generate a new PIN.', undefined, 400);
            return;
        }

        // Verify PIN
        const isPinValid = await user.comparePin(pin);

        if (!isPinValid) {
            // Increment failed attempts
            await user.incrementPinAttempts();

            const attemptsRemaining = 3 - user.pinAttempts;
            if (attemptsRemaining > 0) {
                ResponseHelper.unauthorized(res, `Invalid PIN. ${attemptsRemaining} attempts remaining.`);
            } else {
                ResponseHelper.error(res, 'Invalid PIN. Account locked for 15 minutes due to multiple failed attempts.', undefined, 429);
            }
            return;
        }

        // PIN is valid - reset attempts and clear PIN data
        await user.resetPinAttempts();
        user.pin = undefined;
        user.pinExpiry = undefined;
        await user.save();

        // Update login statistics
        user.lastLogin = new Date();
        user.loginCount += 1;
        await user.save();

        // Create user payload and generate token
        const userPayload: UserPayload = user.toUserPayload();
        const token = generateToken(userPayload);

        const authResponse: AuthResponse = {
            token,
            user: userPayload
        };

        ResponseHelper.success(res, 'PIN verified successfully', authResponse);
    } catch (error) {
        next(error);
    }
};

export const getAllUsers = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        const result = await UserService.getAllUsers(page, limit);

        ResponseHelper.success(res, 'Users retrieved successfully', result);
    } catch (error) {
        next(error);
    }
};

export const logout = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // Clear all authentication cookies
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/'
        });

        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/'
        });

        res.clearCookie('sessionId', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/'
        });

        // Clear any other authentication-related cookies
        res.clearCookie('auth-token');
        res.clearCookie('user-session');

        // Get the token from Authorization header for potential blacklisting
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];

        if (token) {
            // In a production environment, you would add the token to a blacklist
            // For now, we'll just log it for demonstration
            console.log('Token invalidated for logout:', token.substring(0, 20) + '...');

            // TODO: Add token to blacklist/revocation list
            // Example: await TokenBlacklist.add(token);
            // Or store in Redis with expiration matching token expiry
        }

        // Set headers to prevent caching
        res.set({
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        });

        ResponseHelper.success(res, 'Logged out successfully', {
            success: true,
            message: 'All sessions and tokens have been cleared'
        });
    } catch (error) {
        next(error);
    }
};
