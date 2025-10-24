import React from 'react';
import type { ReactNode } from 'react';
import { useReduxAI } from '../hooks/useReduxAI';
import { AIContext } from '../context/ai.context';

// Re-export types for convenience
export type { AISession, AIMessage, AIMessageImage, AIMessageAttachment } from '../store/api/aiApi';

// AI provider component that uses Redux
export const AIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const aiHook = useReduxAI();

    return (
        <AIContext.Provider value={aiHook}>
            {children}
        </AIContext.Provider>
    );
};
