import mongoose, { Document, Schema } from 'mongoose';

export interface IAvatar extends Document {
    _id: string;
    userId: string;
    name: string;
    gender: string;
    skinTone: string;
    seed?: number;
    images: IAvatarImage[];
    createdAt: Date;
    updatedAt: Date;
}

export interface IAvatarImage {
    id: string;
    view: 'front' | 'side' | 'back' | 'three-quarter';
    url: string;
    filename: string;
    size: number;
    width: number;
    height: number;
    prompt: string;
}

// Avatar Image Schema
const avatarImageSchema = new Schema({
    id: { type: String, required: true },
    view: { type: String, enum: ['front', 'side', 'back', 'three-quarter'], required: true },
    url: { type: String, required: true },
    filename: { type: String, required: true },
    size: { type: Number, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    prompt: { type: String, required: true },
});

// Avatar Schema
const avatarSchema = new Schema({
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    gender: { type: String, required: true },
    skinTone: { type: String, required: true },
    seed: { type: Number },
    images: [avatarImageSchema],
}, {
    timestamps: true,
});

// Indexes for better query performance
avatarSchema.index({ userId: 1, createdAt: -1 });
avatarSchema.index({ userId: 1, updatedAt: -1 });

export const Avatar = mongoose.model<IAvatar>('Avatar', avatarSchema);
