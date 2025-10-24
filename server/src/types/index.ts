export interface User {
    id: string;
    email: string;
    password: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface UserPayload {
    id: string;
    email: string;
    name: string;

}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface GeneratePinRequest {
    email: string;
}

export interface VerifyPinRequest {
    email: string;
    pin: string;
}

export interface PinResponse {
    message: string;
    expiresIn?: number; // minutes
    demoPin?: string; // For demo purposes only - remove in production
}

export interface RegisterRequest {
    email: string;
    password: string;
    name: string;
}

export interface AuthResponse {
    token: string;
    user: UserPayload;
}

export interface DashboardData {
    user: UserPayload;
    stats: {
        totalLogins: number;
        lastLogin: Date;
    };
}

export interface AvatarGenerationRequest {
    gender: 'male' | 'female';
    skinTone: string;
    size?: '1024x1024' | '1024x1792' | '1792x1024';
    provider?: 'openai' | 'sdxl' | 'auto';
}

export interface AvatarImage {
    view: 'front' | 'side' | 'back' | 'three-quarter';
    imageDataUrl: string;
    url: string;
}

export interface AvatarGenerationResponse {
    success: boolean;
    imageDataUrl?: string; // Legacy support for single image
    images?: AvatarImage[]; // New multi-view support
    avatarId?: string;
    meta?: {
        prompt?: string;
        gender?: 'male' | 'female';
        skinTone?: string;
        seed?: number;
        provider?: 'openai' | 'sdxl' | 'auto';
        viewsGenerated?: number;
        avatarId?: string;
    };
    error?: string;
}
