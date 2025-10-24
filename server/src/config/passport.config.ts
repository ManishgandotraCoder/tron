import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { UserPayload } from '../types';
import { UserService } from '../services/user.service';

export const configurePassport = (): void => {
    // Local Strategy for login
    passport.use(new LocalStrategy(
        {
            usernameField: 'email',
            passwordField: 'password'
        },
        async (email: string, password: string, done) => {
            try {
                // Find user by email
                const user = await UserService.findByEmail(email);

                if (!user) {
                    return done(null, false, { message: 'Invalid credentials' });
                }

                // Check if user is active
                if (!user.isActive) {
                    return done(null, false, { message: 'Account is deactivated' });
                }

                // Verify password
                const isValidPassword = await user.comparePassword(password);

                if (!isValidPassword) {
                    return done(null, false, { message: 'Invalid credentials' });
                }

                // Update last login
                await UserService.updateLastLogin(user.id);

                // Return user payload (without password)
                const userPayload: UserPayload = user.toUserPayload();

                return done(null, userPayload);
            } catch (error) {
                return done(error);
            }
        }
    ));

    // JWT Strategy for protecting routes
    passport.use(new JwtStrategy(
        {
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT_SECRET || 'your-secret-key'
        },
        async (payload: UserPayload, done) => {
            try {
                // Find user by id
                const user = await UserService.findById(payload.id);

                if (user && user.isActive) {
                    const userPayload: UserPayload = user.toUserPayload();
                    return done(null, userPayload);
                }

                return done(null, false);
            } catch (error) {
                return done(error, false);
            }
        }
    ));
};
