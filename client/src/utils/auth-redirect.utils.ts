import type { NavigateFunction } from 'react-router-dom';
import { clearAllBrowserData } from './auth.utils';

/**
 * Interface for the authentication check result
 */
export interface AuthCheckResult {
    isValid: boolean;
    shouldRedirect: boolean;
    redirectPath?: string;
}

/**
 * Common helper to check if user is authenticated when accessing login/register pages
 * If authenticated, redirects to dashboard. If token is invalid, clears browser data.
 * 
 * @param navigate - React Router navigate function
 * @param currentPath - Current page path (login or register)
 * @param validateTokenFn - Function that validates the token with the backend
 * @returns Promise with authentication check result
 */
export const handleAuthenticatedUserRedirect = async (
    navigate: NavigateFunction,
    currentPath: string,
    validateTokenFn: () => Promise<{ success: boolean; isAuthenticated: boolean }>
): Promise<AuthCheckResult> => {
    try {
        // Check if user has token in localStorage
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        // If no token or user data, allow access to login/register
        if (!token || !savedUser) {
            return {
                isValid: false,
                shouldRedirect: false
            };
        }

        // Validate token with backend
        const validation = await validateTokenFn();

        if (validation.success && validation.isAuthenticated) {
            // User is authenticated, redirect to dashboard
            console.log(`User is already authenticated, redirecting from ${currentPath} to dashboard`);
            navigate('/', { replace: true });
            return {
                isValid: true,
                shouldRedirect: true,
                redirectPath: '/'
            };
        } else {
            // Token is invalid, clear browser data and stay on current page
            console.log(`Invalid token detected on ${currentPath}, clearing browser data`);
            await clearAllBrowserData();
            return {
                isValid: false,
                shouldRedirect: false
            };
        }
    } catch (error) {
        // Network error or other issues - clear browser data to be safe
        console.error(`Error validating token on ${currentPath}:`, error);
        await clearAllBrowserData();
        return {
            isValid: false,
            shouldRedirect: false
        };
    }
};

/**
 * Function to be used in login/register components
 * Call this in useEffect to handle authentication checks
 * 
 * @param navigate - React Router navigate function
 * @param currentPath - Current page path
 * @param validateTokenFn - Function that validates the token
 * @param onAuthCheckComplete - Optional callback when auth check is complete
 */
export const performAuthRedirectCheck = async (
    navigate: NavigateFunction,
    currentPath: string,
    validateTokenFn: () => Promise<{ success: boolean; isAuthenticated: boolean }>,
    onAuthCheckComplete?: (result: AuthCheckResult) => void
): Promise<void> => {
    const result = await handleAuthenticatedUserRedirect(navigate, currentPath, validateTokenFn);

    if (onAuthCheckComplete) {
        onAuthCheckComplete(result);
    }
};

/**
 * Creates a token validation function using the profile endpoint
 * This is a fallback when there's no dedicated verify-token endpoint
 * 
 * @param profileApiCall - Function that calls the profile API
 * @returns Token validation function
 */
export const createTokenValidator = (
    profileApiCall: () => Promise<unknown>
): (() => Promise<{ success: boolean; isAuthenticated: boolean }>) => {
    return async () => {
        try {
            await profileApiCall();
            return { success: true, isAuthenticated: true };
        } catch (error: unknown) {
            // Check if it's an authentication error
            const apiError = error as { status?: number };
            if (apiError?.status === 401 || apiError?.status === 403) {
                return { success: true, isAuthenticated: false };
            }
            // For other errors, assume network issues
            throw error;
        }
    };
};
