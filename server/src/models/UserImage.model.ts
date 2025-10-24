import mongoose, { Document, Schema } from 'mongoose';

export interface IUserImage extends Document {
    _id: string;
    userId: string;
    filename: string;
    url: string;
    type: 'original' | 'cropped';
    size: number;
    gender?: 'male' | 'female';
    createdAt: Date;
    updatedAt: Date;
}

const userImageSchema = new Schema<IUserImage>({
    userId: { type: String, required: true, index: true },
    filename: { type: String, required: true },
    url: { type: String, required: true },
    type: { type: String, enum: ['original', 'cropped'], default: 'original' },
    size: { type: Number, required: true },
    gender: { type: String, enum: ['male', 'female'], required: false },
}, { timestamps: true });

userImageSchema.index({ userId: 1, createdAt: -1 });
userImageSchema.index({ userId: 1, gender: 1, createdAt: -1 });

export const UserImage = mongoose.model<IUserImage>('UserImage', userImageSchema);
