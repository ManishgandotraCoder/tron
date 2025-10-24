import React from 'react';
import AnimatedBackground from './AnimatedBackground';

// Example usage component showing different themes
const BackgroundDemo: React.FC = () => {
    return (
        <div className="space-y-8 p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">AnimatedBackground Component Themes</h1>

            {/* Sky Theme Example */}
            <div className="relative h-64 rounded-lg overflow-hidden border-2 border-gray-200">
                <div className="bg-gradient-to-br from-sky-100 via-blue-50 to-white h-full">
                    <AnimatedBackground theme="sky" />
                    <div className="relative z-10 flex items-center justify-center h-full">
                        <div className="bg-white/80 backdrop-blur-lg rounded-lg p-6 border border-sky-200/50">
                            <h3 className="text-xl font-semibold text-gray-800">Sky Theme</h3>
                            <p className="text-gray-600">Clean and professional blue theme</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Emerald Theme Example */}
            <div className="relative h-64 rounded-lg overflow-hidden border-2 border-gray-200">
                <div className="bg-gradient-to-br from-emerald-900 via-green-800 to-teal-900 h-full">
                    <AnimatedBackground theme="emerald" />
                    <div className="relative z-10 flex items-center justify-center h-full">
                        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-emerald-400/30">
                            <h3 className="text-xl font-semibold text-emerald-100">Emerald Theme</h3>
                            <p className="text-emerald-200">Nature-inspired green theme</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Purple Theme Example */}
            <div className="relative h-64 rounded-lg overflow-hidden border-2 border-gray-200">
                <div className="bg-gradient-to-br from-purple-100 via-violet-50 to-white h-full">
                    <AnimatedBackground theme="purple" />
                    <div className="relative z-10 flex items-center justify-center h-full">
                        <div className="bg-white/80 backdrop-blur-lg rounded-lg p-6 border border-purple-200/50">
                            <h3 className="text-xl font-semibold text-gray-800">Purple Theme</h3>
                            <p className="text-gray-600">Creative and vibrant purple theme</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Orange Theme Example */}
            <div className="relative h-64 rounded-lg overflow-hidden border-2 border-gray-200">
                <div className="bg-gradient-to-br from-orange-100 via-amber-50 to-white h-full">
                    <AnimatedBackground theme="orange" />
                    <div className="relative z-10 flex items-center justify-center h-full">
                        <div className="bg-white/80 backdrop-blur-lg rounded-lg p-6 border border-orange-200/50">
                            <h3 className="text-xl font-semibold text-gray-800">Orange Theme</h3>
                            <p className="text-gray-600">Warm and energetic orange theme</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Usage Example */}
            <div className="bg-gray-50 rounded-lg p-6 mt-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Usage Examples:</h3>
                <div className="space-y-2 font-mono text-sm">
                    <div className="bg-white p-3 rounded border">
                        <span className="text-gray-600">// Basic usage with sky theme</span><br />
                        <span className="text-blue-600">&lt;AnimatedBackground</span> <span className="text-green-600">theme=</span><span className="text-red-500">"sky"</span> <span className="text-blue-600">/&gt;</span>
                    </div>
                    <div className="bg-white p-3 rounded border">
                        <span className="text-gray-600">// With custom className</span><br />
                        <span className="text-blue-600">&lt;AnimatedBackground</span> <span className="text-green-600">theme=</span><span className="text-red-500">"emerald"</span> <span className="text-green-600">className=</span><span className="text-red-500">"opacity-75"</span> <span className="text-blue-600">/&gt;</span>
                    </div>
                    <div className="bg-white p-3 rounded border">
                        <span className="text-gray-600">// Available themes: 'sky', 'emerald', 'purple', 'orange'</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BackgroundDemo;
