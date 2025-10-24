import React, { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
    useGetProfileQuery,
    useUpdateProfileMutation,
    useDeleteAccountMutation
} from '../store/api/userApi';
import {
    setError,
    clearError,
    setProfile,
    updateProfile as updateProfileAction,
    clearProfile,
    setUpdateLoading
} from '../store/slices/userSlice'; interface ApiError {
    data?: {
        message?: string;
    };
    message?: string;
}

export const useUserProfile = () => {
    const dispatch = useAppDispatch();
    const userState = useAppSelector((state) => state.user); const { data: profileData, isLoading: profileLoading, error: profileError } = useGetProfileQuery();
    const [updateProfileMutation] = useUpdateProfileMutation();
    const [deleteAccountMutation] = useDeleteAccountMutation();

    // Update profile data in Redux when API data changes
    React.useEffect(() => {
        if (profileData?.success && profileData.data?.user) {
            dispatch(setProfile(profileData.data.user));
        }
    }, [profileData, dispatch]);

    // Handle API errors
    React.useEffect(() => {
        if (profileError) {
            const error = profileError as ApiError;
            const errorMessage = error?.data?.message || error?.message || 'Failed to load profile';
            dispatch(setError(errorMessage));
        }
    }, [profileError, dispatch]);

    const updateProfile = useCallback(async (updates: { name?: string; email?: string }) => {
        try {
            dispatch(setUpdateLoading(true));
            dispatch(clearError());

            const result = await updateProfileMutation(updates).unwrap();

            if (result.success && result.data?.user) {
                dispatch(updateProfileAction(result.data.user));
                return { success: true, user: result.data.user };
            } else {
                dispatch(setError(result.message || 'Failed to update profile'));
                return { success: false, error: result.message || 'Failed to update profile' };
            }
        } catch (error: unknown) {
            const apiError = error as ApiError;
            const errorMessage = apiError?.data?.message || apiError?.message || 'An error occurred while updating profile';
            dispatch(setError(errorMessage));
            return { success: false, error: errorMessage };
        } finally {
            dispatch(setUpdateLoading(false));
        }
    }, [dispatch, updateProfileMutation]);

    const deleteAccount = useCallback(async () => {
        try {
            dispatch(setUpdateLoading(true));
            dispatch(clearError());

            const result = await deleteAccountMutation().unwrap();

            if (result.success) {
                dispatch(clearProfile());
                return { success: true };
            } else {
                dispatch(setError(result.message || 'Failed to delete account'));
                return { success: false, error: result.message || 'Failed to delete account' };
            }
        } catch (error: unknown) {
            const apiError = error as ApiError;
            const errorMessage = apiError?.data?.message || apiError?.message || 'An error occurred while deleting account';
            dispatch(setError(errorMessage));
            return { success: false, error: errorMessage };
        } finally {
            dispatch(setUpdateLoading(false));
        }
    }, [dispatch, deleteAccountMutation]);

    const clearUserError = useCallback(() => {
        dispatch(clearError());
    }, [dispatch]);

    return {
        // State
        profile: userState.profile,
        loading: profileLoading || userState.loading,
        updateLoading: userState.updateLoading,
        error: userState.error,

        // Actions
        updateProfile,
        deleteAccount,
        clearError: clearUserError,
    };
};
