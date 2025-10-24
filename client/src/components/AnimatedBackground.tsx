import React from 'react';

interface AnimatedBackgroundProps {
    theme?: 'sky' | 'emerald' | 'purple' | 'orange';
    className?: string;
}

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
    theme = 'sky',
    className = ''
}) => {
    // Define color schemes for different themes
    const themes = {
        sky: {
            background: 'bg-gradient-to-br from-sky-100 via-blue-50 to-white',
            shapes: [
                'bg-gradient-to-r from-sky-200/30 to-blue-300/30',
                'bg-gradient-to-r from-blue-200/30 to-sky-300/30',
                'bg-gradient-to-r from-cyan-200/30 to-sky-300/30',
                'bg-gradient-to-r from-sky-300/30 to-blue-400/30'
            ],
            gridColor: 'rgba(14, 165, 233, 0.1)',
            particles: [
                'bg-sky-400',
                'bg-blue-400',
                'bg-cyan-400',
                'bg-sky-500',
                'bg-blue-300'
            ],
            overlays: [
                'bg-gradient-to-r from-sky-100/50 via-transparent to-blue-100/50',
                'bg-gradient-to-b from-transparent via-white/30 to-transparent'
            ]
        },
        emerald: {
            background: 'bg-gradient-to-br from-emerald-900 via-green-800 to-teal-900',
            shapes: [
                'bg-gradient-to-r from-emerald-500/20 to-teal-500/20',
                'bg-gradient-to-r from-green-500/20 to-emerald-500/20',
                'bg-gradient-to-r from-teal-500/20 to-cyan-500/20',
                'bg-gradient-to-r from-emerald-600/20 to-green-600/20'
            ],
            gridColor: 'rgba(16, 185, 129, 0.1)',
            particles: [
                'bg-emerald-400',
                'bg-green-400',
                'bg-teal-400',
                'bg-emerald-500',
                'bg-green-300'
            ],
            overlays: [
                'bg-gradient-to-r from-emerald-900/30 via-transparent to-teal-900/30',
                'bg-gradient-to-b from-transparent via-emerald-900/20 to-transparent'
            ]
        },
        purple: {
            background: 'bg-gradient-to-br from-purple-100 via-violet-50 to-white',
            shapes: [
                'bg-gradient-to-r from-purple-200/30 to-violet-300/30',
                'bg-gradient-to-r from-violet-200/30 to-purple-300/30',
                'bg-gradient-to-r from-indigo-200/30 to-purple-300/30',
                'bg-gradient-to-r from-purple-300/30 to-violet-400/30'
            ],
            gridColor: 'rgba(147, 51, 234, 0.1)',
            particles: [
                'bg-purple-400',
                'bg-violet-400',
                'bg-indigo-400',
                'bg-purple-500',
                'bg-violet-300'
            ],
            overlays: [
                'bg-gradient-to-r from-purple-100/50 via-transparent to-violet-100/50',
                'bg-gradient-to-b from-transparent via-white/30 to-transparent'
            ]
        },
        orange: {
            background: 'bg-gradient-to-br from-orange-100 via-amber-50 to-white',
            shapes: [
                'bg-gradient-to-r from-orange-200/30 to-amber-300/30',
                'bg-gradient-to-r from-amber-200/30 to-orange-300/30',
                'bg-gradient-to-r from-yellow-200/30 to-orange-300/30',
                'bg-gradient-to-r from-orange-300/30 to-amber-400/30'
            ],
            gridColor: 'rgba(251, 146, 60, 0.1)',
            particles: [
                'bg-orange-400',
                'bg-amber-400',
                'bg-yellow-400',
                'bg-orange-500',
                'bg-amber-300'
            ],
            overlays: [
                'bg-gradient-to-r from-orange-100/50 via-transparent to-amber-100/50',
                'bg-gradient-to-b from-transparent via-white/30 to-transparent'
            ]
        }
    };

    const currentTheme = themes[theme];

    return (
        <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
            {/* Floating geometric shapes */}
            <div className={`absolute top-20 left-10 w-64 h-64 ${currentTheme.shapes[0]} rounded-full animate-float`}></div>
            <div className={`absolute top-40 right-20 w-48 h-48 ${currentTheme.shapes[1]} transform rotate-45 animate-float`} style={{ animationDelay: '1s' }}></div>
            <div className={`absolute bottom-32 left-20 w-40 h-40 ${currentTheme.shapes[2]} rounded-full animate-float`} style={{ animationDelay: '2s' }}></div>
            <div className={`absolute bottom-20 right-32 w-56 h-56 ${currentTheme.shapes[3]} transform -rotate-12 animate-float`} style={{ animationDelay: '0.5s' }}></div>

            {/* Grid pattern overlay */}
            <div className="absolute inset-0 opacity-20">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `
                            linear-gradient(${currentTheme.gridColor} 1px, transparent 1px),
                            linear-gradient(90deg, ${currentTheme.gridColor} 1px, transparent 1px)
                        `,
                        backgroundSize: '50px 50px'
                    }}
                ></div>
            </div>

            {/* Animated particles */}
            <div className={`absolute top-1/4 left-1/3 w-2 h-2 ${currentTheme.particles[0]} rounded-full animate-pulse opacity-60`}></div>
            <div className={`absolute top-3/4 left-1/4 w-3 h-3 ${currentTheme.particles[1]} rounded-full animate-pulse opacity-40`} style={{ animationDelay: '1s' }}></div>
            <div className={`absolute top-1/2 right-1/4 w-2 h-2 ${currentTheme.particles[2]} rounded-full animate-pulse opacity-50`} style={{ animationDelay: '2s' }}></div>
            <div className={`absolute top-1/3 right-1/3 w-1 h-1 ${currentTheme.particles[3]} rounded-full animate-pulse opacity-70`} style={{ animationDelay: '1.5s' }}></div>
            <div className={`absolute bottom-1/3 left-1/2 w-2 h-2 ${currentTheme.particles[4]} rounded-full animate-pulse opacity-60`} style={{ animationDelay: '0.5s' }}></div>

            {/* Gradient overlays for depth */}
            <div className={`absolute top-0 left-0 w-full h-full ${currentTheme.overlays[0]}`}></div>
            <div className={`absolute top-0 left-0 w-full h-full ${currentTheme.overlays[1]}`}></div>
        </div>
    );
};

export default AnimatedBackground;
