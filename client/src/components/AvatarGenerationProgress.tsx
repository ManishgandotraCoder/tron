import React from 'react';

interface AvatarGenerationProgressProps {
    progress: number;
    currentStep: string;
    isVisible: boolean;
}

export const AvatarGenerationProgress: React.FC<AvatarGenerationProgressProps> = ({
    progress,
    currentStep,
    isVisible
}) => {
    if (!isVisible) return null;

    const steps = [
        { name: "Initialize", icon: "⚡" },
        { name: "Front View", icon: "👤" },
        { name: "Side View", icon: "🔄" },
        { name: "Back View", icon: "🔙" },
        { name: "3/4 View", icon: "📐" },
        { name: "Processing", icon: "⚙️" }
    ];

    const currentStepIndex = Math.min(Math.floor(progress / 20), steps.length - 1);

    return (
        <div className="space-y-4 p-4 bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20 rounded-xl border border-sky-200 dark:border-sky-700">
            {/* Progress Header */}
            <div className="text-center space-y-1">
                <div className="text-sm font-semibold text-sky-700 dark:text-sky-300">
                    Generating Your 3D Avatar
                </div>
                <div className="text-xs text-sky-600 dark:text-sky-400">
                    Creating multiple viewing angles for realistic 3D experience
                </div>
            </div>

            {/* Step Indicators */}
            <div className="flex justify-between items-center px-2">
                {steps.map((step, index) => (
                    <div
                        key={step.name}
                        className={`flex flex-col items-center space-y-1 transition-all duration-300 ${index <= currentStepIndex
                                ? 'text-sky-600 dark:text-sky-400'
                                : 'text-gray-400 dark:text-gray-600'
                            }`}
                    >
                        <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all duration-300 ${index < currentStepIndex
                                    ? 'bg-sky-600 text-white scale-110'
                                    : index === currentStepIndex
                                        ? 'bg-sky-500 text-white scale-125 shadow-lg animate-pulse'
                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                                }`}
                        >
                            {index < currentStepIndex ? '✓' : step.icon}
                        </div>
                        <span className="text-xs font-medium">{step.name}</span>
                    </div>
                ))}
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
                <div className="flex justify-between text-sm">
                    <span className="text-sky-700 dark:text-sky-300 font-medium">{currentStep}</span>
                    <span className="text-sky-600 dark:text-sky-400 font-bold">{progress}%</span>
                </div>
                <div className="w-full bg-sky-100 dark:bg-sky-900/30 rounded-full h-3 overflow-hidden">
                    <div
                        className="bg-gradient-to-r from-sky-500 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out relative overflow-hidden"
                        style={{ width: `${progress}%` }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                    </div>
                </div>
            </div>

            {/* Time Estimate */}
            <div className="text-center">
                <div className="text-xs text-sky-600 dark:text-sky-400">
                    ⏱️ Estimated time: {progress < 50 ? '45-60' : progress < 80 ? '20-30' : '5-10'} seconds remaining
                </div>
            </div>

            {/* Fun fact during loading */}
            <div className="text-center p-2 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                <div className="text-xs text-gray-600 dark:text-gray-400">
                    💡 <span className="font-medium">Did you know?</span> We're creating 4 different viewing angles to give you a complete 3D-like experience!
                </div>
            </div>
        </div>
    );
};
