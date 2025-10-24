import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface User {
    id: string;
    email: string;
    name: string;
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
    pinGenerated: boolean;
    generatedPin: string | null;
    showPinAuth: boolean;
}

const initialState: AuthState = {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    pinGenerated: false,
    generatedPin: null,
    showPinAuth: false,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
        setUser: (state, action: PayloadAction<User>) => {
            state.user = action.payload;
            state.isAuthenticated = true;
        },
        setToken: (state, action: PayloadAction<string>) => {
            state.token = action.payload;
            localStorage.setItem('token', action.payload);
        },
        setPinGenerated: (state, action: PayloadAction<{ pin: string }>) => {
            state.pinGenerated = true;
            state.generatedPin = action.payload.pin;
            state.showPinAuth = true;
        },
        setShowPinAuth: (state, action: PayloadAction<boolean>) => {
            state.showPinAuth = action.payload;
            if (!action.payload) {
                state.pinGenerated = false;
                state.generatedPin = null;
            }
        },
        resetPinAuth: (state) => {
            state.pinGenerated = false;
            state.generatedPin = null;
            state.showPinAuth = false;
            state.error = null;
        },
        loginSuccess: (state, action: PayloadAction<{ user: User; token?: string }>) => {
            state.user = action.payload.user;
            state.isAuthenticated = true;
            state.loading = false;
            state.error = null;
            state.showPinAuth = false;
            state.pinGenerated = false;
            state.generatedPin = null;

            if (action.payload.token) {
                state.token = action.payload.token;
                localStorage.setItem('token', action.payload.token);
            }

            // Store user in localStorage
            localStorage.setItem('user', JSON.stringify(action.payload.user));
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.loading = false;
            state.error = null;
            state.pinGenerated = false;
            state.generatedPin = null;
            state.showPinAuth = false;

            // Clear all storage (this is also done in the hook but ensures consistency)
            try {
                localStorage.clear();
                sessionStorage.clear();
            } catch (error) {
                console.warn('Failed to clear storage in authSlice:', error);
            }
        },
        initializeAuth: (state) => {
            // Check for existing user session
            const savedUser = localStorage.getItem('user');
            const savedToken = localStorage.getItem('token');

            if (savedUser && savedToken) {
                try {
                    state.user = JSON.parse(savedUser);
                    state.token = savedToken;
                    state.isAuthenticated = true;
                } catch {
                    // Clear invalid data
                    localStorage.removeItem('user');
                    localStorage.removeItem('token');
                }
            }
        },
    },
});

export const {
    setLoading,
    setError,
    clearError,
    setUser,
    setToken,
    setPinGenerated,
    setShowPinAuth,
    resetPinAuth,
    loginSuccess,
    logout,
    initializeAuth,
} = authSlice.actions;

export default authSlice.reducer;
