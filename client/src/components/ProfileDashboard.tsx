import React, { useState } from 'react';
import { useReduxAuth } from '../hooks/useReduxAuth';
import { useUserProfile } from '../hooks/useUserProfile';

const Dashboard: React.FC = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState('');
    const [editEmail, setEditEmail] = useState('');

    const { user, loading: authLoading } = useReduxAuth();
    const {
        profile,
        loading: profileLoading,
        updateLoading,
        error: profileError,
        updateProfile,
        clearError
    } = useUserProfile();

    const currentUser = profile || user;

    React.useEffect(() => {
        if (currentUser && !isEditing) {
            setEditName(currentUser.name || '');
            setEditEmail(currentUser.email || '');
        }
    }, [currentUser, isEditing]);

    const handleEdit = () => {
        setIsEditing(true);
        if (currentUser) {
            setEditName(currentUser.name || '');
            setEditEmail(currentUser.email || '');
        }
    };

    const handleSave = async () => {
        if (!currentUser) return;

        const updates: { name?: string; email?: string } = {};
        if (editName !== currentUser.name) updates.name = editName;
        if (editEmail !== currentUser.email) updates.email = editEmail;

        if (Object.keys(updates).length > 0) {
            const result = await updateProfile(updates);
            if (result.success) {
                setIsEditing(false);
            }
        } else {
            setIsEditing(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        if (currentUser) {
            setEditName(currentUser.name || '');
            setEditEmail(currentUser.email || '');
        }
    };

    const clearProfileError = () => {
        clearError();
    };

    if (authLoading || profileLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
            </div>
        );
    }

    if (!currentUser) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Not authenticated</h2>
                    <p className="text-gray-600">Please log in to access your dashboard.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="py-8 px-4 sm:px-6 lg:px-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <div className="max-w-6xl mx-auto">
                {/* Enhanced Header Section */}
                <div className="text-center mb-12 relative">
                    <div className="absolute inset-0 flex items-center justify-center opacity-10">
                        <div className="w-96 h-96 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-3xl"></div>
                    </div>
                    <div className="relative">
                        <div className="mx-auto h-24 w-24 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-6 shadow-2xl transform hover:scale-105 transition-transform duration-300 relative">
                            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-pulse opacity-50"></div>
                            <svg className="h-12 w-12 text-white relative z-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-800 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-3 animate-fadeInUp">
                            Welcome back, {currentUser.name}!
                        </h1>
                        <p className="text-gray-600 text-xl font-medium animate-fadeInUp animation-delay-200">
                            Manage your account and explore your dashboard
                        </p>
                        <div className="mt-6 flex justify-center space-x-4">
                            <div className="bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
                                <span className="text-sm font-medium text-gray-600">Member since 2024</span>
                            </div>
                            <div className="bg-green-100/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
                                <span className="text-sm font-medium text-green-700">✓ Verified</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                        <div className="flex items-center">
                            <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl">
                                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Account Status</p>
                                <p className="text-2xl font-bold text-gray-900">Active</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                        <div className="flex items-center">
                            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Security Level</p>
                                <p className="text-2xl font-bold text-gray-900">High</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                        <div className="flex items-center">
                            <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl">
                                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Last Login</p>
                                <p className="text-2xl font-bold text-gray-900">Today</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid gap-8 lg:grid-cols-2">
                    {/* Profile Information - Takes 2 columns */}
                    <div className="lg:col-span-2">
                        <div className="bg-white/90 backdrop-blur-lg shadow-2xl rounded-3xl p-8 border border-white/20 hover:shadow-3xl transition-all duration-300">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center space-x-4">
                                    <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl">
                                        <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                                        Profile Information
                                    </h2>
                                </div>
                                {!isEditing && (
                                    <button
                                        onClick={handleEdit}
                                        className="group px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                    >
                                        <svg className="h-5 w-5 group-hover:rotate-12 transition-transform duration-200" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        <span className="font-medium">Edit Profile</span>
                                    </button>
                                )}
                            </div>

                            {profileError && (
                                <div className="mb-6 bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-400 rounded-xl p-4 shadow-lg animate-slideInDown">
                                    <div className="flex items-center justify-between">
                                        <div className="flex">
                                            <div className="flex-shrink-0">
                                                <svg className="h-5 w-5 text-red-400 animate-pulse" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <div className="ml-3">
                                                <p className="text-red-800 text-sm font-medium">{profileError}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={clearProfileError}
                                            className="text-red-400 hover:text-red-600 transition-colors duration-200 hover:scale-110 transform"
                                        >
                                            <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-6">
                                <div className="group">
                                    <label className="block text-sm font-semibold text-gray-700 mb-3 group-hover:text-blue-600 transition-colors duration-200">
                                        Full Name
                                    </label>
                                    {isEditing ? (
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm shadow-lg"
                                                placeholder="Enter your full name"
                                            />
                                            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-4 py-3 rounded-xl border border-gray-200 shadow-inner">
                                            <p className="text-gray-900 font-medium text-lg">{currentUser.name}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="group">
                                    <label className="block text-sm font-semibold text-gray-700 mb-3 group-hover:text-blue-600 transition-colors duration-200">
                                        Email Address
                                    </label>
                                    {isEditing ? (
                                        <div className="relative">
                                            <input
                                                type="email"
                                                value={editEmail}
                                                onChange={(e) => setEditEmail(e.target.value)}
                                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm shadow-lg"
                                                placeholder="Enter your email address"
                                            />
                                            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                                </svg>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-4 py-3 rounded-xl border border-gray-200 shadow-inner">
                                            <p className="text-gray-900 font-medium text-lg">{currentUser.email}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="group">
                                    <label className="block text-sm font-semibold text-gray-700 mb-3 group-hover:text-blue-600 transition-colors duration-200">
                                        User ID
                                    </label>
                                    <div className="bg-gradient-to-r from-gray-50 to-slate-50 px-4 py-3 rounded-xl border border-gray-200 shadow-inner">
                                        <p className="text-gray-600 font-mono text-sm break-all">{currentUser.id}</p>
                                    </div>
                                </div>
                            </div>

                            {isEditing && (
                                <div className="flex space-x-4 mt-8 animate-slideInUp">
                                    <button
                                        onClick={handleSave}
                                        disabled={updateLoading}
                                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-6 rounded-xl hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
                                    >
                                        {updateLoading ? (
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        ) : (
                                            <>
                                                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                <span className="font-medium">Save Changes</span>
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={handleCancel}
                                        disabled={updateLoading}
                                        className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white py-3 px-6 rounded-xl hover:from-gray-600 hover:to-gray-700 disabled:opacity-50 transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
                                    >
                                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                        <span className="font-medium">Cancel</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Dashboard;
