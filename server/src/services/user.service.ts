import { User, IUser } from '../models/User.model';
import { RegisterRequest, UserPayload } from '../types';

export class UserService {
    /**
     * Create a new user
     */
    static async createUser(userData: RegisterRequest): Promise<IUser> {
        const user = new User(userData);
        return await user.save();
    }

    /**
     * Find user by email
     */
    static async findByEmail(email: string): Promise<IUser | null> {
        let user = await User.findOne({ email: email.toLowerCase() });

        if (user) {
            console.log("Found user:", {
                id: user._id,
                email: user.email,
                name: user.name,
                isActive: user.isActive,
                hasName: !!user.name
            });

            // If user is missing name field, add a default name
            if (!user.name) {
                console.log("User missing name field, updating with default name");
                user.name = user.email.split('@')[0]; // Use email prefix as default name
                user = await user.save();
                console.log("Updated user with default name:", user.name);
            }
        }

        return user;
    }

    /**
     * Find user by ID
     */
    static async findById(id: string): Promise<IUser | null> {
        return await User.findById(id);
    }

    /**
     * Update user's last login
     */
    static async updateLastLogin(userId: string): Promise<IUser | null> {
        return await User.findByIdAndUpdate(
            userId,
            {
                lastLogin: new Date(),
                $inc: { loginCount: 1 }
            },
            { new: true }
        );
    }

    /**
     * Get user stats for dashboard
     */
    static async getUserStats(userId: string): Promise<{
        totalLogins: number;
        lastLogin: Date | null;
    }> {
        const user = await User.findById(userId);
        return {
            totalLogins: user?.loginCount || 0,
            lastLogin: user?.lastLogin || null
        };
    }

    /**
     * Check if email exists
     */
    static async emailExists(email: string): Promise<boolean> {
        const user = await User.findOne({ email: email.toLowerCase() });
        return !!user;
    }

    /**
     * Get all users (admin function)
     */
    static async getAllUsers(page: number = 1, limit: number = 10): Promise<{
        users: IUser[];
        total: number;
        page: number;
        totalPages: number;
    }> {
        const skip = (page - 1) * limit;

        const [users, total] = await Promise.all([
            User.find({}, '-password').skip(skip).limit(limit).sort({ createdAt: -1 }),
            User.countDocuments()
        ]);

        return {
            users,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
    }

    /**
     * Update user profile
     */
    static async updateProfile(
        userId: string,
        updateData: Partial<Pick<IUser, 'name'>>
    ): Promise<IUser | null> {
        return await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true }
        );
    }

    /**
     * Deactivate user
     */
    static async deactivateUser(userId: string): Promise<IUser | null> {
        return await User.findByIdAndUpdate(
            userId,
            { isActive: false },
            { new: true }
        );
    }
}
