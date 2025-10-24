import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from '.';
import { initializeAuth } from './slices/authSlice';

interface ReduxProviderProps {
    children: React.ReactNode;
}

const AppInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    useEffect(() => {
        // Initialize auth state from localStorage
        store.dispatch(initializeAuth());
    }, []);

    return <>{children}</>;
};

export const ReduxProvider: React.FC<ReduxProviderProps> = ({ children }) => {
    return (
        <Provider store={store}>
            <AppInitializer>
                {children}
            </AppInitializer>
        </Provider>
    );
};
