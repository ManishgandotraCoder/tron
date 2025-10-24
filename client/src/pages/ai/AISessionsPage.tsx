import React from 'react';
import { useReduxAI } from '../../hooks/useReduxAI';
import { AnimatedBackground } from '../../components';
import type { AISession } from '../../store/api/aiApi';

interface AISessionsPageProps {
    className?: string;
}

export const AISessionsPage: React.FC<AISessionsPageProps> = ({ className = '' }) => {
    const {
        sessions,
        currentSession,
        selectedModel,
        newSessionName,
        showNewSessionForm,
        loading,
        error,
        setCurrentSession,
        setSelectedModel,
        setNewSessionName,
        setShowNewSessionForm,
        createSession,
        deleteSession,
    } = useReduxAI();

    const availableModels = [
        { id: 'gpt-4', name: 'GPT-4' },
        { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
        { id: 'claude-3', name: 'Claude 3' },
        { id: 'gemini-pro', name: 'Gemini Pro' }
    ];

    const handleCreateSession = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newSessionName.trim()) {
            const success = await createSession(newSessionName.trim(), selectedModel);
            if (success) {
                setNewSessionName('');
                setShowNewSessionForm(false);
            }
        }
    };

    const formatDate = (date: Date): string => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getSessionStats = (session: AISession) => {
        const userMessages = session.messages.filter(msg => msg.role === 'user').length;
        const aiMessages = session.messages.filter(msg => msg.role === 'assistant').length;
        return { userMessages, aiMessages, total: session.messages.length };
    };

    return (
        <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 ${className}`}>
            <AnimatedBackground />

            <div className="relative z-10 container mx-auto px-4 py-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">AI Chat Sessions</h1>
                    <p className="text-gray-600 mb-6">Manage your AI conversation sessions</p>

                    <button
                        onClick={() => setShowNewSessionForm(true)}
                        className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors inline-flex items-center space-x-2"
                    >
                        <span>+</span>
                        <span>Create New Session</span>
                    </button>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="text-red-800">
                            Error: {error.toString()}
                        </div>
                    </div>
                )}

                {/* Sessions Grid */}
                {sessions.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-8 max-w-md mx-auto">
                            <div className="text-gray-400 text-6xl mb-4">💬</div>
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Sessions Yet</h3>
                            <p className="text-gray-500 mb-6">
                                Create your first AI chat session to get started with intelligent conversations.
                            </p>
                            <button
                                onClick={() => setShowNewSessionForm(true)}
                                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                Create First Session
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sessions.map((session: AISession) => {
                            const stats = getSessionStats(session);
                            const isActive = currentSession?.id === session.id;

                            return (
                                <div
                                    key={session.id}
                                    className={`bg-white/90 backdrop-blur-sm rounded-lg p-6 shadow-md hover:shadow-lg transition-all cursor-pointer ${isActive ? 'ring-2 ring-indigo-500 bg-indigo-50/90' : ''
                                        }`}
                                    onClick={() => setCurrentSession(session)}
                                >
                                    {/* Session Header */}
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-lg font-semibold text-gray-900 truncate mb-1">
                                                {session.name}
                                            </h3>
                                            <div className="flex items-center space-x-2">
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                                    {session.model}
                                                </span>
                                                {isActive && (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        Active
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (confirm('Are you sure you want to delete this session?')) {
                                                    deleteSession(session.id);
                                                }
                                            }}
                                            className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                                            title="Delete session"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>

                                    {/* Session Stats */}
                                    <div className="grid grid-cols-3 gap-3 mb-4">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-indigo-600">{stats.total}</div>
                                            <div className="text-xs text-gray-500">Total Messages</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-blue-600">{stats.userMessages}</div>
                                            <div className="text-xs text-gray-500">User Messages</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-purple-600">{stats.aiMessages}</div>
                                            <div className="text-xs text-gray-500">AI Responses</div>
                                        </div>
                                    </div>

                                    {/* Last Message Preview */}
                                    {session.messages.length > 0 && (
                                        <div className="mb-4">
                                            <div className="text-sm text-gray-500 mb-1">Last message:</div>
                                            <div className="text-sm text-gray-700 bg-gray-50 rounded p-2 line-clamp-2">
                                                {session.messages[session.messages.length - 1].content}
                                            </div>
                                        </div>
                                    )}

                                    {/* Session Dates */}
                                    <div className="text-xs text-gray-500 space-y-1">
                                        <div>Created: {formatDate(session.createdAt)}</div>
                                        <div>Updated: {formatDate(session.updatedAt)}</div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setCurrentSession(session);
                                                // Navigate to chat page (you'd implement this based on your routing)
                                                window.location.href = '/ai/chat';
                                            }}
                                            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                                        >
                                            Open Chat
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
                            <div className="animate-spin w-6 h-6 border-2 border-gray-300 border-t-indigo-600 rounded-full"></div>
                            <span className="text-gray-700">Processing...</span>
                        </div>
                    </div>
                )}
            </div>

            {/* New Session Modal */}
            {showNewSessionForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96 max-w-[90vw]">
                        <h3 className="text-xl font-semibold mb-6">Create New AI Session</h3>

                        <form onSubmit={handleCreateSession} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Session Name *
                                </label>
                                <input
                                    type="text"
                                    value={newSessionName}
                                    onChange={(e) => setNewSessionName(e.target.value)}
                                    placeholder="e.g., Project Planning, Creative Writing..."
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    autoFocus
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    AI Model
                                </label>
                                <select
                                    value={selectedModel}
                                    onChange={(e) => setSelectedModel(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                >
                                    {availableModels.map((model) => (
                                        <option key={model.id} value={model.id}>
                                            {model.name}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-sm text-gray-500 mt-1">
                                    Choose the AI model that best fits your needs
                                </p>
                            </div>

                            <div className="flex justify-end space-x-3 pt-6">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowNewSessionForm(false);
                                        setNewSessionName('');
                                    }}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!newSessionName.trim() || loading}
                                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {loading ? 'Creating...' : 'Create Session'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
