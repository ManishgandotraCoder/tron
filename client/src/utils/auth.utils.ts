/**
 * Comprehensive logout utility that clears all browser storage and sessions
 */
export const clearAllBrowserData = async (): Promise<void> => {
    try {
        // Note: The server should also send 'Clear-Site-Data' header which instructs
        // the browser to clear cache, cookies, storage, and execution contexts
        // Header: Clear-Site-Data: "cache", "cookies", "storage", "executionContexts"

        // Clear localStorage
        localStorage.clear();

        // Clear sessionStorage
        sessionStorage.clear();

        // Clear all cookies
        const cookies = document.cookie.split(";");
        for (const cookie of cookies) {
            const eqPos = cookie.indexOf("=");
            const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();

            // Clear cookie for current path
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;

            // Clear cookie for current domain
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;

            // Clear cookie for parent domain
            const domainParts = window.location.hostname.split('.');
            if (domainParts.length > 1) {
                const parentDomain = domainParts.slice(-2).join('.');
                document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${parentDomain}`;
            }
        }


        // Clear sessionStorage
        sessionStorage.clear();

        // Clear Cache Storage
        if ('caches' in window) {
            try {
                const cacheNames = await caches.keys();
                await Promise.all(
                    cacheNames.map(cacheName => caches.delete(cacheName))
                );
            } catch (error) {
                console.warn('Failed to clear cache storage:', error);
            }
        }

    } catch (error) {
        console.error('Error during comprehensive logout cleanup:', error);
        throw error;
    }
};

/**
 * Force logout and redirect to login page
 */
export const forceLogout = async (): Promise<void> => {
    await clearAllBrowserData();

    // Small delay to ensure cleanup is complete
    setTimeout(() => {
        // Force navigation to login page
        window.location.href = '/login';
    }, 100);
};

/**
 * Secure logout that also notifies the server
 */
export const secureLogout = async (logoutApiCall?: () => Promise<unknown>): Promise<void> => {
    try {
        // Call logout API if provided
        if (logoutApiCall) {
            await logoutApiCall();
        }
    } catch (error) {
        console.warn('Logout API call failed:', error);
    } finally {
        // Always perform local cleanup regardless of API response
        await forceLogout();
    }
};
