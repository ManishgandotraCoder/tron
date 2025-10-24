import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Types
export interface LoginRequest {
    email: string;
    pin?: string;
}

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    data?: {
        user: {
            id: string;
            email: string;
            name: string;
        };
        token?: string;
        message?: string;
        expiresIn?: number;
        demoPin?: string; // For demo purposes only
    };
    pin?: string; // For PIN-based auth
}

export interface VerifyPinRequest {
    email: string;
    pin: string;
}

// API base URL - adjust this to match your server
const API_BASE_URL = 'http://localhost:3000/api';

export const authApi = createApi({
    reducerPath: 'authApi',
    baseQuery: fetchBaseQuery({
        baseUrl: `${API_BASE_URL}/user`,
        prepareHeaders: (headers) => {
            // Add auth token if available
            const token = localStorage.getItem('token');
            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            }
            headers.set('content-type', 'application/json');
            return headers;
        },
    }),
    tagTypes: ['Auth'],
    endpoints: (builder) => ({
        // Generate PIN for login
        generatePin: builder.mutation<AuthResponse, { email: string }>({
            query: (credentials) => ({
                url: '/generate-pin',
                method: 'POST',
                body: credentials,
            }),
        }),

        // Verify PIN and login
        verifyPin: builder.mutation<AuthResponse, VerifyPinRequest>({
            query: (credentials) => ({
                url: '/verify-pin',
                method: 'POST',
                body: credentials,
            }),
            invalidatesTags: ['Auth'],
        }),

        // Traditional login (if needed)
        login: builder.mutation<AuthResponse, LoginRequest>({
            query: (credentials) => ({
                url: '/login',
                method: 'POST',
                body: credentials,
            }),
            invalidatesTags: ['Auth'],
        }),

        // Register new user
        register: builder.mutation<AuthResponse, RegisterRequest>({
            query: (userData) => ({
                url: '/register',
                method: 'POST',
                body: userData,
            }),
            invalidatesTags: ['Auth'],
        }),

        // Logout
        logout: builder.mutation<{ success: boolean }, void>({
            query: () => ({
                url: '/logout',
                method: 'POST',
            }),
            invalidatesTags: ['Auth'],
        }),

        // Verify token
        verifyToken: builder.query<AuthResponse, void>({
            query: () => '/verify-token',
            providesTags: ['Auth'],
        }),

        // Get user profile (can be used for token validation)
        getProfile: builder.query<AuthResponse, void>({
            query: () => '/profile',
            providesTags: ['Auth'],
        }),
    }),
});

export const {
    useGeneratePinMutation,
    useVerifyPinMutation,
    useLoginMutation,
    useRegisterMutation,
    useLogoutMutation,
    useVerifyTokenQuery,
    useGetProfileQuery,
    useLazyGetProfileQuery,
} = authApi;
