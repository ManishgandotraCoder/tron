import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
    useGeneratePinMutation,
    useVerifyPinMutation,
    useRegisterMutation,
    useLogoutMutation
} from '../store/api/authApi';
import {
    setError,
    clearError,
    setPinGenerated,
    resetPinAuth,
    loginSuccess,
    logout as logoutAction,
    setLoading
} from '../store/slices/authSlice';
// import { secureLogout } from '../utils/auth.utils';

interface ApiError {
    data?: {
        message?: string;
    };
    message?: string;
}

export const useReduxAuth = () => {
    const dispatch = useAppDispatch();
    const authState = useAppSelector((state) => state.auth);

    const [generatePinMutation] = useGeneratePinMutation();
    const [verifyPinMutation] = useVerifyPinMutation();
    const [registerMutation] = useRegisterMutation();
    const [logoutMutation] = useLogoutMutation();

    const generatePin = useCallback(async (email: string) => {
        try {
            dispatch(setLoading(true));
            dispatch(clearError());

            const result = await generatePinMutation({ email }).unwrap();

            // Check if the API call was successful
            if (result.success) {
                // Get the demo PIN from the response data
                const demoPin = result.data?.demoPin || "000000";
                dispatch(setPinGenerated({ pin: demoPin }));
                return { success: true, pin: demoPin };
            } else {
                dispatch(setError(result.message || 'Failed to generate PIN'));
                return { success: false, error: result.message || 'Failed to generate PIN' };
            }
        } catch (error: unknown) {
            const apiError = error as ApiError;
            const errorMessage = apiError?.data?.message || apiError?.message || 'An error occurred while generating PIN';
            dispatch(setError(errorMessage));
            return { success: false, error: errorMessage };
        } finally {
            dispatch(setLoading(false));
        }
    }, [dispatch, generatePinMutation]);

    const verifyPin = useCallback(async (email: string, pin: string) => {
        try {
            dispatch(setLoading(true));
            dispatch(clearError());

            const result = await verifyPinMutation({ email, pin }).unwrap();

            if (result.success && result.data) {
                dispatch(loginSuccess({
                    user: result.data.user,
                    token: result.data.token
                }));
                return { success: true, user: result.data.user };
            } else {
                dispatch(setError(result.message || 'Invalid PIN'));
                return { success: false, error: result.message || 'Invalid PIN' };
            }
        } catch (error: unknown) {
            const apiError = error as ApiError;
            const errorMessage = apiError?.data?.message || apiError?.message || 'An error occurred while verifying PIN';
            dispatch(setError(errorMessage));
            return { success: false, error: errorMessage };
        } finally {
            dispatch(setLoading(false));
        }
    }, [dispatch, verifyPinMutation]);

    const register = useCallback(async (name: string, email: string, password: string) => {
        try {
            dispatch(setLoading(true));
            dispatch(clearError());

            const result = await registerMutation({ name, email, password }).unwrap();

            if (result.success && result.data) {
                dispatch(loginSuccess({
                    user: result.data.user,
                    token: result.data.token
                }));
                return { success: true, user: result.data.user };
            } else {
                dispatch(setError(result.message || 'Registration failed'));
                return { success: false, error: result.message || 'Registration failed' };
            }
        } catch (error: unknown) {
            const apiError = error as ApiError;
            const errorMessage = apiError?.data?.message || apiError?.message || 'An error occurred during registration';
            dispatch(setError(errorMessage));
            return { success: false, error: errorMessage };
        } finally {
            dispatch(setLoading(false));
        }
    }, [dispatch, registerMutation]);

    const logout = useCallback(async () => {
        // This will call the backend logout API
        await logoutMutation().unwrap();
        // Clear Redux state
        dispatch(logoutAction());
    }, [dispatch, logoutMutation]);

    const resetPin = useCallback(() => {
        dispatch(resetPinAuth());
    }, [dispatch]);

    const clearAuthError = useCallback(() => {
        dispatch(clearError());
    }, [dispatch]);

    return {
        // State
        user: authState.user,
        isAuthenticated: authState.isAuthenticated,
        loading: authState.loading,
        error: authState.error,
        showPinAuth: authState.showPinAuth,
        pinGenerated: authState.pinGenerated,
        generatedPin: authState.generatedPin,

        // Actions
        generatePin,
        verifyPin,
        register,
        logout,
        resetPin,
        clearError: clearAuthError,
    };
};
