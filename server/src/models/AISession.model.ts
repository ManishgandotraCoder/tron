import mongoose, { Document, Schema } from 'mongoose';

// AI Session interface
export interface IAISession extends Document {
    _id: string;
    userId: string;
    name: string;
    aiModel: string;
    createdAt: Date;
    updatedAt: Date;
    messages: IAIMessage[];
}

// AI Message interface
export interface IAIMessage {
    id: string;
    content: string;
    role: 'user' | 'assistant';
    timestamp: Date;
    images?: IAIMessageImage[];
    attachments?: IAIMessageAttachment[];
}

// AI Message Image interface
export interface IAIMessageImage {
    id: string;
    url: string;
    filename: string;
    size: number;
    mimeType: string;
    width?: number;
    height?: number;
}

// AI Message Attachment interface
export interface IAIMessageAttachment {
    id: string;
    url: string;
    filename: string;
    size: number;
    mimeType: string;
}

// Message Image Schema
const messageImageSchema = new Schema({
    id: { type: String, required: true },
    url: { type: String, required: true },
    filename: { type: String, required: true },
    size: { type: Number, required: true },
    mimeType: { type: String, required: true },
    width: { type: Number },
    height: { type: Number },
});

// Message Attachment Schema
const messageAttachmentSchema = new Schema({
    id: { type: String, required: true },
    url: { type: String, required: true },
    filename: { type: String, required: true },
    size: { type: Number, required: true },
    mimeType: { type: String, required: true },
});

// Message Schema
const messageSchema = new Schema({
    id: { type: String, required: true },
    content: { type: String, required: true },
    role: { type: String, enum: ['user', 'assistant'], required: true },
    timestamp: { type: Date, default: Date.now },
    images: [messageImageSchema],
    attachments: [messageAttachmentSchema],
});

// AI Session Schema
const aiSessionSchema = new Schema({
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    aiModel: { type: String, required: true },
    messages: [messageSchema],
}, {
    timestamps: true,
});

// Indexes for better query performance
aiSessionSchema.index({ userId: 1, createdAt: -1 });
aiSessionSchema.index({ userId: 1, updatedAt: -1 });

export const AISession = mongoose.model<IAISession>('AISession', aiSessionSchema);
