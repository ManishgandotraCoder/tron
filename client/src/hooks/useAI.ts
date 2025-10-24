import { useContext } from 'react';
import { AIContext } from '../context/ai.context';

// Custom hook to use AI context
export const useAI = () => {
    const context = useContext(AIContext);
    if (context === undefined) {
        throw new Error('useAI must be used within an AIProvider');
    }
    return context;
};
