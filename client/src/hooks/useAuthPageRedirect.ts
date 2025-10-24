import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLazyGetProfileQuery } from '../store/api/authApi';
import { performAuthRedirectCheck, createTokenValidator } from '../utils/auth-redirect.utils';
import type { AuthCheckResult } from '../utils/auth-redirect.utils';

/**
 * Custom hook to handle authentication checks for login/register pages
 * Automatically redirects authenticated users to dashboard or clears invalid tokens
 * 
 * @param currentPath - The current page path ('login' or 'register')
 * @returns Object with loading state and auth check result
 */
export const useAuthPageRedirect = (currentPath: string) => {
    const navigate = useNavigate();
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [authResult, setAuthResult] = useState<AuthCheckResult | null>(null);

    // Use lazy query for profile to manually trigger the request
    const [getProfile] = useLazyGetProfileQuery();

    useEffect(() => {
        const checkAuthentication = async () => {
            try {
                setCheckingAuth(true);

                // Create token validator using profile API
                const tokenValidator = createTokenValidator(async () => {
                    const result = await getProfile().unwrap();
                    return result;
                });

                // Perform auth check
                await performAuthRedirectCheck(
                    navigate,
                    currentPath,
                    tokenValidator,
                    (result) => {
                        setAuthResult(result);
                        setCheckingAuth(false);
                    }
                );
            } catch (error) {
                console.error('Error during auth check:', error);
                setAuthResult({
                    isValid: false,
                    shouldRedirect: false
                });
                setCheckingAuth(false);
            }
        };

        checkAuthentication();
    }, [currentPath, navigate, getProfile]);

    return {
        checkingAuth,
        authResult,
        isAuthenticated: authResult?.isValid || false,
        shouldRedirect: authResult?.shouldRedirect || false
    };
};
