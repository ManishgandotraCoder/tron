import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface User {
    id: string;
    email: string;
    name: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface UserState {
    profile: User | null;
    loading: boolean;
    error: string | null;
    updateLoading: boolean;
}

const initialState: UserState = {
    profile: null,
    loading: false,
    error: null,
    updateLoading: false,
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setUpdateLoading: (state, action: PayloadAction<boolean>) => {
            state.updateLoading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
        setProfile: (state, action: PayloadAction<User>) => {
            state.profile = action.payload;
        },
        updateProfile: (state, action: PayloadAction<Partial<User>>) => {
            if (state.profile) {
                state.profile = { ...state.profile, ...action.payload };
            }
        },
        clearProfile: (state) => {
            state.profile = null;
        },
    },
});

export const {
    setLoading,
    setUpdateLoading,
    setError,
    clearError,
    setProfile,
    updateProfile,
    clearProfile,
} = userSlice.actions;

export default userSlice.reducer;
