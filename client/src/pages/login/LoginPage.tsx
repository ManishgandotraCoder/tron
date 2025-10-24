import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthPageRedirect } from '../../hooks/useAuthPageRedirect';
import { useReduxAuth } from '../../hooks/useReduxAuth';
import { AnimatedBackground } from '../../components';

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [enteredPin, setEnteredPin] = useState('');

    // Check if user is already authenticated and handle redirects
    const { checkingAuth, shouldRedirect } = useAuthPageRedirect('login');

    const {
        loading,
        error,
        showPinAuth,
        generatedPin,
        generatePin,
        verifyPin,
        resetPin
    } = useReduxAuth();

    const navigate = useNavigate();

    // Don't render the form if we're checking auth or should redirect
    if (checkingAuth || shouldRedirect) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-100 via-blue-50 to-white">
                <div className="flex items-center space-x-2">
                    <svg className="animate-spin h-6 w-6 text-sky-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-sky-600 font-medium">
                        {checkingAuth ? 'Checking authentication...' : 'Redirecting...'}
                    </span>
                </div>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!showPinAuth) {
            handleGeneratePin();
        }
    };

    const handleGeneratePin = async () => {
        if (!email) {
            return;
        }

        const result = await generatePin(email);
        if (result.success) {
            // PIN generated successfully, the UI will automatically show the PIN input field
            // because showPinAuth will be set to true by the Redux state
            console.log('PIN generated successfully');
        } else {
            console.error('Error generating PIN:', result.error);
        }
    };

    const handleVerifyPin = async () => {
        if (!enteredPin) {
            return;
        }

        const result = await verifyPin(email, enteredPin);
        if (result.success) {
            navigate('/');
        }
    };

    const handleResetPinAuth = () => {
        resetPin();
        setEnteredPin('');
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-sky-100 via-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8">
            <AnimatedBackground theme="sky" />

            <div className="max-w-md w-full space-y-8 relative z-10">
                <div className="text-center animate-fadeInUp">
                    <div className="mx-auto h-16 w-16 bg-gradient-to-r from-sky-500 to-blue-600 rounded-full flex items-center justify-center mb-6 shadow-2xl animate-bounceIn hover:scale-110 transition-transform duration-300 cursor-pointer group relative">
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 animate-pulse opacity-75"></div>
                        <svg className="h-8 w-8 text-white group-hover:rotate-12 transition-transform duration-300 relative z-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                    </div>
                    <h2 className="text-4xl font-bold text-gray-800 mb-2 animate-slideInLeft drop-shadow-lg">
                        Welcome back
                    </h2>
                    <p className="text-gray-600 text-lg animate-slideInRight drop-shadow-md" style={{ animationDelay: '0.2s' }}>
                        Sign in with PIN authentication
                    </p>
                    <p className="mt-4 text-sm text-gray-500 animate-fadeIn" style={{ animationDelay: '0.4s' }}>
                        Don't have an account?{' '}
                        <Link
                            to="/register"
                            className="font-semibold text-sky-600 hover:text-sky-700 transition-all duration-300 hover:underline hover:decoration-wavy underline-offset-4"
                        >
                            Create one here
                        </Link>
                    </p>
                </div>

                <div className="bg-white/80 backdrop-blur-lg shadow-2xl rounded-2xl p-8 border border-sky-200/50 animate-scaleIn hover:shadow-3xl transition-all duration-500 hover:scale-[1.02] hover:bg-white/90 hover:border-sky-300/60" style={{ animationDelay: '0.6s' }}>
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && !showPinAuth && (
                            <div className="bg-red-50 border-l-4 border-red-400 rounded-lg p-4 shadow-sm animate-shakeX">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-red-400 animate-pulse" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-red-800 text-sm font-medium">{error}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="group animate-slideInUp" style={{ animationDelay: '0.8s' }}>
                                <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 mb-2 group-hover:text-sky-700 transition-colors duration-200">
                                    Email address
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-sky-400 group-focus-within:text-sky-600 group-focus-within:scale-110 transition-all duration-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                        </svg>
                                    </div>
                                    <input
                                        id="email-address"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        className="block w-full pl-10 pr-3 py-3 border border-sky-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-lg focus:shadow-xl transform focus:scale-[1.02] hover:border-sky-300 bg-white/90"
                                        placeholder="Enter your email address"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* PIN Authentication Section */}
                        {showPinAuth && (
                            <div className="space-y-4 animate-slideInUp border-t border-sky-200 pt-6">
                                <div className="text-center">
                                    <h3 className="text-lg font-medium text-gray-800 mb-2">PIN Authentication</h3>
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                                        <p className="text-sm text-green-800">
                                            A 6-digit PIN has been generated successfully! In a real app, this would be sent to your email.
                                        </p>
                                        {generatedPin && (
                                            <p className="text-xs text-green-600 mt-1 font-mono">
                                                Demo PIN: {generatedPin}
                                            </p>
                                        )}
                                    </div>
                                    {error && (
                                        <div className="bg-red-50 border-l-4 border-red-400 rounded-lg p-4 shadow-sm animate-shakeX mb-4">
                                            <div className="flex">
                                                <div className="flex-shrink-0">
                                                    <svg className="h-5 w-5 text-red-400 animate-pulse" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                                <div className="ml-3">
                                                    <p className="text-red-800 text-sm font-medium">{error}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="group">
                                    <label htmlFor="pin" className="block text-sm font-medium text-gray-700 mb-2 group-hover:text-sky-700 transition-colors duration-200">
                                        Enter 6-digit PIN
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg className="h-5 w-5 text-sky-400 group-focus-within:text-sky-600 group-focus-within:scale-110 transition-all duration-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-0.257-0.257A6 6 0 1118 8zM2 8a6 6 0 1112 0A6 6 0 012 8zm8-2a2 2 0 100 4 2 2 0 000-4z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <input
                                            id="pin"
                                            name="pin"
                                            type="text"
                                            maxLength={6}
                                            pattern="[0-9]{6}"
                                            className="block w-full pl-10 pr-3 py-3 border border-sky-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-lg focus:shadow-xl transform focus:scale-[1.02] hover:border-sky-300 bg-white/90 text-center text-lg font-mono tracking-widest"
                                            placeholder="000000"
                                            value={enteredPin}
                                            onChange={(e) => setEnteredPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        />
                                    </div>
                                </div>

                                <div className="flex space-x-3">
                                    <button
                                        type="button"
                                        onClick={handleVerifyPin}
                                        disabled={enteredPin.length !== 6 || loading}
                                        className="flex-1 group relative flex justify-center py-3 px-4 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02] active:scale-95"
                                    >
                                        <span className="relative z-10">
                                            {loading ? 'Verifying...' : 'Verify PIN'}
                                        </span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleResetPinAuth}
                                        className="flex-1 group relative flex justify-center py-3 px-4 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02] active:scale-95"
                                    >
                                        <span className="relative z-10">Cancel</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {!showPinAuth && (
                            <button
                                type="button"
                                onClick={handleGeneratePin}
                                disabled={loading || !email}
                                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02] active:scale-95 animate-slideInUp overflow-hidden"
                                style={{ animationDelay: '1.4s' }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-sky-600 to-blue-700 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                                <span className="absolute left-0 inset-y-0 flex items-center pl-3 z-10">
                                    {loading ? (
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    ) : (
                                        <svg className="h-5 w-5 text-white group-hover:text-sky-100 transition-all duration-300 group-hover:rotate-12 group-hover:scale-110" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 616 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </span>
                                <span className="relative z-10">
                                    {loading ? 'Generating PIN...' : 'Generate PIN to Sign In'}
                                </span>
                            </button>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
