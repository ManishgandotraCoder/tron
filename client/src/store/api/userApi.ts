import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Types
export interface User {
    id: string;
    email: string;
    name: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface UpdateProfileRequest {
    name?: string;
    email?: string;
}

export interface UpdateProfileResponse {
    success: boolean;
    message: string;
    data?: {
        user: User;
    };
}

export interface GetProfileResponse {
    success: boolean;
    message: string;
    data?: {
        user: User;
    };
}

// API base URL - adjust this to match your server
const API_BASE_URL = 'http://localhost:3000/api';

export const userApi = createApi({
    reducerPath: 'userApi',
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
    tagTypes: ['User'],
    endpoints: (builder) => ({
        // Get user profile
        getProfile: builder.query<GetProfileResponse, void>({
            query: () => '/profile',
            providesTags: ['User'],
        }),

        // Update user profile
        updateProfile: builder.mutation<UpdateProfileResponse, UpdateProfileRequest>({
            query: (userData) => ({
                url: '/profile',
                method: 'PUT',
                body: userData,
            }),
            invalidatesTags: ['User'],
        }),

        // Delete user account
        deleteAccount: builder.mutation<{ success: boolean; message: string }, void>({
            query: () => ({
                url: '/profile',
                method: 'DELETE',
            }),
            invalidatesTags: ['User'],
        }),
    }),
});

export const {
    useGetProfileQuery,
    useUpdateProfileMutation,
    useDeleteAccountMutation,
} = userApi;
