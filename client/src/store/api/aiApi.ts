import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Types
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
}

export interface AIMessageAttachment {
    id: string;
    url: string;
    filename: string;
    size: number;
    mimeType: string;
}

export interface CreateSessionRequest {
    name: string;
    model: string;
}

export interface SendMessageRequest {
    sessionId: string;
    content: string;
    images?: File[];
    attachments?: File[];
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
    url?: string;
}

export interface AvatarGenerationResponse {
    success: boolean;
    avatarId?: string;
    images?: AvatarImage[];
    imageDataUrl?: string; // Legacy support
    meta?: {
        prompt?: string;
        gender?: string;
        skinTone?: string;
        seed?: number;
        provider?: string;
        viewsGenerated?: number;
    };
    error?: string;
}

export interface SavedAvatar {
    id: string;
    name: string;
    gender: string;
    skinTone: string;
    images: Array<{
        view: string;
        url: string;
    }>;
    createdAt: string;
}

export interface GetAvatarsResponse {
    success: boolean;
    avatars?: SavedAvatar[];
    error?: string;
}

export interface UpdateSessionRequest {
    sessionId: string;
    session: AISession;
}

export interface UploadResponse {
    success: boolean;
    url: string;
    filename: string;
}

export interface AIResponse {
    success: boolean;
    message: string;
    data?: unknown;
}

export interface UserImage {
    id: string;
    url: string;
    filename: string;
    type: 'original' | 'cropped';
    size: number;
    gender?: 'male' | 'female';
    createdAt?: string;
}
export interface SaveUserImageRequest { imageDataUrl: string; type?: 'original' | 'cropped'; gender?: 'male' | 'female'; }
export interface SaveUserImageResponse { success: boolean; image?: UserImage; error?: string; }
export interface ListUserImagesResponse { success: boolean; images?: UserImage[]; grouped?: { male: UserImage[]; female: UserImage[] }; error?: string; }

// API base URL
const API_BASE_URL = 'http://localhost:3000/api';

export const aiApi = createApi({
    reducerPath: 'aiApi',
    baseQuery: fetchBaseQuery({
        baseUrl: `${API_BASE_URL}/ai`,
        prepareHeaders: (headers) => {
            // Add auth token if available
            const token = localStorage.getItem('token');
            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ['AISession', 'AIMessage', 'Avatar', 'UserImage'],
    endpoints: (builder) => ({
        // Get all sessions
        getSessions: builder.query<{ sessions: AISession[] }, void>({
            query: () => '/sessions',
            providesTags: ['AISession'],
        }),

        // Get a specific session
        getSession: builder.query<AISession, string>({
            query: (sessionId) => `/sessions/${sessionId}`,
            providesTags: (_result, _error, sessionId) => [
                { type: 'AISession', id: sessionId },
            ],
        }),

        // Create a new session
        createSession: builder.mutation<AISession, CreateSessionRequest>({
            query: (sessionData) => ({
                url: '/sessions',
                method: 'POST',
                body: sessionData,
            }),
            invalidatesTags: ['AISession'],
        }),

        // Update a session
        updateSession: builder.mutation<AISession, UpdateSessionRequest>({
            query: ({ sessionId, session }) => ({
                url: `/sessions/${sessionId}`,
                method: 'PUT',
                body: session,
            }),
            invalidatesTags: (_result, _error, { sessionId }) => [
                { type: 'AISession', id: sessionId },
                'AISession',
            ],
        }),

        // Delete a session
        deleteSession: builder.mutation<AIResponse, string>({
            query: (sessionId) => ({
                url: `/sessions/${sessionId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['AISession'],
        }),

        // Upload image
        uploadImage: builder.mutation<UploadResponse, File>({
            query: (file) => {
                const formData = new FormData();
                formData.append('image', file);
                return {
                    url: '/upload/image',
                    method: 'POST',
                    body: formData,
                    formData: true,
                };
            },
        }),

        // Upload attachment
        uploadAttachment: builder.mutation<UploadResponse, File>({
            query: (file) => {
                const formData = new FormData();
                formData.append('attachment', file);
                return {
                    url: '/upload/attachment',
                    method: 'POST',
                    body: formData,
                    formData: true,
                };
            },
        }),

        // Send message (this would typically include AI processing)
        sendMessage: builder.mutation<AIMessage, SendMessageRequest>({
            query: ({ sessionId, content, images, attachments }) => {
                const formData = new FormData();
                formData.append('content', content);
                formData.append('sessionId', sessionId);

                if (images && images.length > 0) {
                    images.forEach((image, index) => {
                        formData.append(`images[${index}]`, image);
                    });
                }

                if (attachments && attachments.length > 0) {
                    attachments.forEach((attachment, index) => {
                        formData.append(`attachments[${index}]`, attachment);
                    });
                }

                return {
                    url: '/message',
                    method: 'POST',
                    body: formData,
                    formData: true,
                };
            },
            invalidatesTags: (_result, _error, { sessionId }) => [
                { type: 'AISession', id: sessionId },
            ],
        }),

        // Generate AI Avatar
        generateAvatar: builder.mutation<AvatarGenerationResponse, AvatarGenerationRequest>({
            query: (avatarData) => ({
                url: `${API_BASE_URL}/generate-avatar`,
                method: 'POST',
                body: avatarData,
            }),
        }),

        // Get user's saved avatars
        getUserAvatars: builder.query<GetAvatarsResponse, void>({
            query: () => ({
                url: `${API_BASE_URL}/avatars`,
                method: 'GET',
            }),
            providesTags: ['Avatar'],
        }),

        // Get specific avatar by ID
        getAvatarById: builder.query<{ success: boolean; avatar?: SavedAvatar; error?: string }, string>({
            query: (avatarId) => ({
                url: `${API_BASE_URL}/avatars/${avatarId}`,
                method: 'GET',
            }),
            providesTags: (_result, _error, avatarId) => [
                { type: 'Avatar', id: avatarId },
            ],
        }),
        saveUserImage: builder.mutation<SaveUserImageResponse, SaveUserImageRequest>({
            query: (payload) => ({
                url: `${API_BASE_URL}/user-images`,
                method: 'POST',
                body: payload,
            }),
            invalidatesTags: ['UserImage']
        }),
        listUserImages: builder.query<ListUserImagesResponse, { gender?: 'male' | 'female' } | void>({
            query: (args) => {
                const gender = (args as { gender?: 'male' | 'female' } | undefined)?.gender;
                const qs = gender ? `?gender=${gender}` : '';
                return {
                    url: `${API_BASE_URL}/user-images${qs}`,
                    method: 'GET',
                };
            },
            providesTags: ['UserImage']
        }),
        deleteUserImage: builder.mutation<{ success: boolean; deletedId?: string; error?: string }, string>({
            query: (id) => ({
                url: `${API_BASE_URL}/user-images/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['UserImage']
        })
    }),
});

export const {
    useGetSessionsQuery,
    useGetSessionQuery,
    useCreateSessionMutation,
    useUpdateSessionMutation,
    useDeleteSessionMutation,
    useUploadImageMutation,
    useUploadAttachmentMutation,
    useSendMessageMutation,
    useGenerateAvatarMutation,
    useGetUserAvatarsQuery,
    useGetAvatarByIdQuery,
    useSaveUserImageMutation,
    useListUserImagesQuery,
    useDeleteUserImageMutation,
} = aiApi;
