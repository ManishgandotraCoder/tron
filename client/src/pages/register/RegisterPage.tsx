import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthPageRedirect } from '../../hooks/useAuthPageRedirect';
import { useReduxAuth } from '../../hooks/useReduxAuth';
import { AnimatedBackground } from '../../components';


const RegisterPage: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [localError, setLocalError] = useState('');

    // Check if user is already authenticated and handle redirects
    const { checkingAuth, shouldRedirect } = useAuthPageRedirect('register');

    const { register, loading, error } = useReduxAuth();
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
        setLocalError('');

        if (!name || !email || !password || !confirmPassword) {
            setLocalError('Please fill in all fields');
            return;
        }

        if (!agreeTerms) {
            setLocalError('Please agree to the Terms of Service and Privacy Policy');
            return;
        }

        if (password !== confirmPassword) {
            setLocalError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setLocalError('Password must be at least 6 characters long');
            return;
        }

        const result = await register(name, email, password);
        if (result.success) {
            navigate('/');
        }
    };

    const displayError = localError || error;

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-sky-100 via-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8">
            <AnimatedBackground theme="sky" />

            <div className="max-w-md w-full space-y-8 relative z-10">
                <div className="text-center animate-fadeInUp">
                    <div className="mx-auto h-16 w-16 bg-gradient-to-r from-sky-500 to-blue-600 rounded-full flex items-center justify-center mb-6 shadow-2xl animate-bounceIn hover:scale-110 transition-transform duration-300 cursor-pointer group relative">
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 animate-pulse opacity-75"></div>
                        <svg className="h-8 w-8 text-white group-hover:rotate-12 transition-transform duration-300 relative z-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                    </div>
                    <h2 className="text-4xl font-bold text-gray-800 mb-2 animate-slideInLeft drop-shadow-lg">
                        Create account
                    </h2>
                    <p className="text-gray-600 text-lg animate-slideInRight drop-shadow-md" style={{ animationDelay: '0.2s' }}>
                        Join us and start your journey
                    </p>
                    <p className="mt-4 text-sm text-gray-500 animate-fadeIn" style={{ animationDelay: '0.4s' }}>
                        Already have an account?{' '}
                        <Link
                            to="/login"
                            className="font-semibold text-sky-600 hover:text-sky-700 transition-all duration-300 hover:underline hover:decoration-wavy underline-offset-4"
                        >
                            Sign in here
                        </Link>
                    </p>
                </div>

                <div className="bg-white/80 backdrop-blur-lg shadow-2xl rounded-2xl p-8 border border-sky-200/50 animate-scaleIn hover:shadow-3xl transition-all duration-500 hover:scale-[1.02] hover:bg-white/90 hover:border-sky-300/60" style={{ animationDelay: '0.6s' }}>
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {displayError && (
                            <div className="bg-red-50 border-l-4 border-red-400 rounded-lg p-4 shadow-sm animate-shakeX">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-red-400 animate-pulse" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-red-800 text-sm font-medium">{displayError}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="group animate-slideInUp" style={{ animationDelay: '0.8s' }}>
                                <label htmlFor="full-name" className="block text-sm font-medium text-gray-700 mb-2 group-hover:text-sky-700 transition-colors duration-200">
                                    Full name
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-sky-400 group-focus-within:text-sky-600 group-focus-within:scale-110 transition-all duration-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <input
                                        id="full-name"
                                        name="name"
                                        type="text"
                                        autoComplete="name"
                                        required
                                        className="block w-full pl-10 pr-3 py-3 border border-sky-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-lg focus:shadow-xl transform focus:scale-[1.02] hover:border-sky-300 bg-white/90"
                                        placeholder="Enter your full name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="group animate-slideInUp" style={{ animationDelay: '1.0s' }}>
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

                            <div className="group animate-slideInUp" style={{ animationDelay: '1.2s' }}>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2 group-hover:text-sky-700 transition-colors duration-200">
                                    Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-sky-400 group-focus-within:text-sky-600 group-focus-within:scale-110 transition-all duration-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 616 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        autoComplete="new-password"
                                        required
                                        className="block w-full pl-10 pr-3 py-3 border border-sky-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-lg focus:shadow-xl transform focus:scale-[1.02] hover:border-sky-300 bg-white/90"
                                        placeholder="Create a password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="group animate-slideInUp" style={{ animationDelay: '1.4s' }}>
                                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-2 group-hover:text-sky-700 transition-colors duration-200">
                                    Confirm password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-sky-400 group-focus-within:text-sky-600 group-focus-within:scale-110 transition-all duration-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <input
                                        id="confirm-password"
                                        name="confirmPassword"
                                        type="password"
                                        autoComplete="new-password"
                                        required
                                        className="block w-full pl-10 pr-3 py-3 border border-sky-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-lg focus:shadow-xl transform focus:scale-[1.02] hover:border-sky-300 bg-white/90"
                                        placeholder="Confirm your password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center animate-slideInUp" style={{ animationDelay: '1.6s' }}>
                                <input
                                    id="agree-terms"
                                    name="agreeTerms"
                                    type="checkbox"
                                    className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded transition-all duration-300 transform hover:scale-110"
                                    checked={agreeTerms}
                                    onChange={(e) => setAgreeTerms(e.target.checked)}
                                />
                                <label htmlFor="agree-terms" className="ml-2 block text-sm text-gray-700 hover:text-sky-700 transition-colors duration-200 cursor-pointer">
                                    I agree to the{' '}
                                    <a href="#" className="text-sky-600 hover:text-sky-700 font-medium hover:underline">
                                        Terms of Service
                                    </a>{' '}
                                    and{' '}
                                    <a href="#" className="text-sky-600 hover:text-sky-700 font-medium hover:underline">
                                        Privacy Policy
                                    </a>
                                </label>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02] active:scale-95 animate-slideInUp overflow-hidden"
                            style={{ animationDelay: '1.8s' }}
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
                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </span>
                            <span className="relative z-10">
                                {loading ? 'Creating Account...' : 'Create Account'}
                            </span>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
