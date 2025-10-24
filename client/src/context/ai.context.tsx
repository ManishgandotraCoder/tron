import { createContext } from 'react';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import type { SerializedError } from '@reduxjs/toolkit';

// AI interface
export interface AISession {
    id: string;
    name: string;
    model: string;
    createdAt: Date;
    updatedAt: Date;
    messages: AIMessage[];
}

export interface AIMessage {
    id: string;
    content: string;
    role: 'user' | 'assistant';
    timestamp: Date;
    images?: AIMessageImage[];
    attachments?: AIMessageAttachment[];
}

export interface AIMessageImage {
    id: string;
    url: string;
    filename: string;
    size: number;
    mimeType: string;
    width?: number;
    height?: number;
}

export interface AIMessageAttachment {
    id: string;
    url: string;
    filename: string;
    size: number;
    mimeType: string;
}

// AI context interface
export interface AIContextType {
    // Data
    sessions: AISession[];
    currentSession: AISession | null;
    selectedModel: string;
    messageInput: string;
    selectedImages: File[];
    selectedAttachments: File[];
    previewImages: string[];
    showNewSessionForm: boolean;
    showImageModal: boolean;
    modalImageUrl: string;
    newSessionName: string;

    // Loading states
    loading: boolean;
    uploading: boolean;
    error: FetchBaseQueryError | SerializedError | undefined;

    // Actions
    setCurrentSession: (session: AISession | null) => void;
    setSelectedModel: (model: string) => void;
    setMessageInput: (input: string) => void;
    setSelectedImages: (images: File[]) => void;
    setSelectedAttachments: (attachments: File[]) => void;
    setShowNewSessionForm: (show: boolean) => void;
    setShowImageModal: (show: boolean) => void;
    setModalImageUrl: (url: string) => void;
    setNewSessionName: (name: string) => void;

    // API operations
    createSession: (name: string, model: string) => Promise<boolean>;
    deleteSession: (sessionId: string) => Promise<boolean>;
    sendMessage: (content: string, images?: File[], attachments?: File[]) => Promise<boolean>;
    uploadImage: (file: File) => Promise<string | null>;
    deleteMessage: (messageId: string) => Promise<boolean>;
    editMessage: (messageId: string, newContent: string) => Promise<boolean>;
    regenerateResponse: (messageId: string) => Promise<boolean>;
}

// Create the context
export const AIContext = createContext<AIContextType | undefined>(undefined);

