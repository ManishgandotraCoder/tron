import React from 'react';
import { useAuth } from '../modules/user.module';

const Dashboard: React.FC = () => {
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-gray-700">Welcome, {user?.name}!</span>
                            <button
                                onClick={handleLogout}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 p-8">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                Welcome to your Dashboard!
                            </h2>
                            <p className="text-gray-600 mb-6">
                                You have successfully logged in to your account.
                            </p>
                            <div className="bg-white rounded-lg shadow p-6 max-w-md mx-auto">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Your Profile</h3>
                                <div className="space-y-2">
                                    <p><span className="font-medium">Name:</span> {user?.name}</p>
                                    <p><span className="font-medium">Email:</span> {user?.email}</p>
                                    <p><span className="font-medium">User ID:</span> {user?.id}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
