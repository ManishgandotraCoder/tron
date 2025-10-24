import React, { useEffect } from 'react';

interface GenerationCompleteNotificationProps {
    isVisible: boolean;
    onClose: () => void;
    viewCount: number;
}

export const GenerationCompleteNotification: React.FC<GenerationCompleteNotificationProps> = ({
    isVisible,
    onClose,
    viewCount
}) => {
    useEffect(() => {
        if (isVisible) {
            // Auto-close after 3 seconds
            const timer = setTimeout(() => {
                onClose();
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose]);

    if (!isVisible) return null;

    return (
        <div className="fixed top-4 right-4 z-50 animate-fadeInUp">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl p-4 shadow-lg max-w-sm">
                <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
                            <span className="text-green-600 dark:text-green-400 text-lg">✨</span>
                        </div>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-sm font-semibold text-green-800 dark:text-green-200">
                            Avatar Generated Successfully!
                        </h3>
                        <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                            {viewCount} viewing angles created. Your 3D avatar is ready!
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="flex-shrink-0 text-green-400 hover:text-green-600 transition-colors"
                    >
                        <span className="sr-only">Close</span>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};
