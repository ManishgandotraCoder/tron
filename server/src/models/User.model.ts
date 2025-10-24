import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
    email: string;
    password: string;
    name: string;
    lastLogin?: Date;
    loginCount: number;
    isActive: boolean;
    pin?: string;
    pinExpiry?: Date;
    pinAttempts: number;
    pinLockedUntil?: Date;
    maleAvatarFilename?: string | null; // male avatar image filename
    femaleAvatarFilename?: string | null; // female avatar image filename
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
    comparePin(candidatePin: string): Promise<boolean>;
    generatePin(): Promise<string>;
    isPinExpired(): boolean;
    isPinLocked(): boolean;
    incrementPinAttempts(): Promise<void>;
    resetPinAttempts(): Promise<void>;
    toUserPayload(): {
        id: string;
        email: string;
        name: string;
        maleAvatarFilename?: string | null;
        femaleAvatarFilename?: string | null;
    };
}

const userSchema = new Schema<IUser>({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long']
    },
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters long'],
        maxlength: [50, 'Name must not exceed 50 characters']
    },

    lastLogin: {
        type: Date,
        default: null
    },
    loginCount: {
        type: Number,
        default: 0
    },
    pin: {
        type: String,
        default: null
    },
    pinExpiry: {
        type: Date,
        default: null
    },
    pinAttempts: {
        type: Number,
        default: 0
    },
    pinLockedUntil: {
        type: Date,
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    },
    maleAvatarFilename: {
        type: String,
        default: null
    },
    femaleAvatarFilename: {
        type: String,
        default: null
    }
}, {
    timestamps: true,
    toJSON: {
        transform: function (_doc, ret) {
            if ((ret as any).password) delete (ret as any).password;
            return ret;
        }
    }
});

// Index for email for faster queries
userSchema.index({ email: 1 });

// Pre-save middleware to hash password and pin
userSchema.pre('save', async function (next) {
    try {
        // Hash password if it has been modified (or is new)
        if (this.isModified('password')) {
            const hashedPassword = await bcrypt.hash(this.password, 12);
            this.password = hashedPassword;
        }

        // Hash pin if it has been modified (or is new)
        if (this.isModified('pin') && this.pin) {
            const hashedPin = await bcrypt.hash(this.pin, 12);
            this.pin = hashedPin;
        }

        next();
    } catch (error) {
        next(error as Error);
    }
});

// Instance method to compare password
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
};

// Instance method to compare pin
userSchema.methods.comparePin = async function (candidatePin: string): Promise<boolean> {
    if (!this.pin) return false;
    return bcrypt.compare(candidatePin, this.pin);
};

// Instance method to generate a 6-digit PIN
userSchema.methods.generatePin = async function (): Promise<string> {
    console.log(".....generatePin...generatePin..generatePin");
    console.log("User object:", {
        id: this._id,
        email: this.email,
        name: this.name,
        isActive: this.isActive
    });

    // Check if required fields are present
    if (!this.name) {
        throw new Error('User object is missing required name field');
    }
    if (!this.email) {
        throw new Error('User object is missing required email field');
    }

    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    const plainPin = pin; // Store the plain PIN to return
    console.log(".....1");

    this.pin = pin; // This will be hashed by the pre-save middleware
    this.pinExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
    this.pinAttempts = 0;
    this.pinLockedUntil = null;
    console.log(".....2");

    try {
        await this.save();
        console.log(".....3 - Save successful", plainPin);
    } catch (error) {
        console.error(".....Save failed:", error);
        throw error;
    }

    return plainPin; // Return the plain PIN (not the hashed one)
};

// Instance method to check if PIN is expired
userSchema.methods.isPinExpired = function (): boolean {
    if (!this.pinExpiry) return true;
    return new Date() > this.pinExpiry;
};

// Instance method to check if PIN is locked
userSchema.methods.isPinLocked = function (): boolean {
    if (!this.pinLockedUntil) return false;
    return new Date() < this.pinLockedUntil;
};

// Instance method to increment PIN attempts
userSchema.methods.incrementPinAttempts = async function (): Promise<void> {
    this.pinAttempts += 1;

    // Lock for 15 minutes after 3 failed attempts
    if (this.pinAttempts >= 3) {
        this.pinLockedUntil = new Date(Date.now() + 15 * 60 * 1000);
    }

    await this.save();
};

// Instance method to reset PIN attempts
userSchema.methods.resetPinAttempts = async function (): Promise<void> {
    this.pinAttempts = 0;
    this.pinLockedUntil = null;
    await this.save();
};

// Instance method to get user payload (without sensitive data)
userSchema.methods.toUserPayload = function () {
    return {
        id: this._id.toString(),
        email: this.email,
        name: this.name,
        maleAvatarFilename: this.maleAvatarFilename || null,
        femaleAvatarFilename: this.femaleAvatarFilename || null,
    };
};

// Static method to find user by email
userSchema.statics.findByEmail = function (email: string) {
    return this.findOne({ email: email.toLowerCase() });
};

export const User = mongoose.model<IUser>('User', userSchema);
