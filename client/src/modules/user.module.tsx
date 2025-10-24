import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

// User interface
export interface User {
    id: string;
    email: string;
    name: string;
}

// Auth context interface
interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<boolean>;
    register: (name: string, email: string, password: string) => Promise<boolean>;
    logout: () => void;
    loading: boolean;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);

    const login = async (email: string, password: string): Promise<boolean> => {
        setLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Mock authentication - in real app, this would be an API call
            if (email && password.length >= 6) {
                const mockUser: User = {
                    id: '1',
                    email: email,
                    name: email.split('@')[0]
                };
                setUser(mockUser);
                localStorage.setItem('user', JSON.stringify(mockUser));
                return true;
            }
            return false;
        } catch (error) {
            console.error('Login error:', error);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const register = async (name: string, email: string, password: string): Promise<boolean> => {
        setLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Mock registration - in real app, this would be an API call
            if (name && email && password.length >= 6) {
                const mockUser: User = {
                    id: '1',
                    email: email,
                    name: name
                };
                setUser(mockUser);
                localStorage.setItem('user', JSON.stringify(mockUser));
                return true;
            }
            return false;
        } catch (error) {
            console.error('Registration error:', error);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    // Check for existing user session on mount
    React.useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch (error) {
                console.error('Error parsing saved user:', error);
                localStorage.removeItem('user');
            }
        }
    }, []);

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
