import React from 'react';
import { useGetUserAvatarsQuery, type SavedAvatar } from '../store/api/aiApi';
// import { useGetUserAvatarsQuery, type SavedAvatar } from '../../store/api/aiApi';

interface SavedAvatarsProps {
    onAvatarSelect?: (avatar: SavedAvatar) => void;
}

export const SavedAvatars: React.FC<SavedAvatarsProps> = ({ onAvatarSelect }) => {
    const { data: savedAvatarsData, isLoading, error } = useGetUserAvatarsQuery();

    if (isLoading) {
        return (
            <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur p-5 shadow-sm">
                <div className="text-center text-gray-500">Loading saved avatars...</div>
            </div>
        );
    }

    if (error || !savedAvatarsData?.success) {
        return (
            <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur p-5 shadow-sm">
                <div className="text-center text-red-500">Error loading avatars</div>
            </div>
        );
    }

    const avatars = savedAvatarsData.avatars || [];

    if (avatars.length === 0) {
        return (
            <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur p-5 shadow-sm">
                <div className="text-center space-y-2">
                    <h3 className="text-lg font-medium">No Saved Avatars</h3>
                    <p className="text-sm text-gray-500">Generate your first 3D avatar to see it here</p>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur p-5 shadow-sm">
            <h3 className="text-lg font-medium mb-4">Saved Avatars ({avatars.length})</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {avatars.map((avatar) => (
                    <div
                        key={avatar.id}
                        className="border border-gray-200 dark:border-white/10 rounded-xl p-3 hover:shadow-md transition cursor-pointer"
                        onClick={() => onAvatarSelect?.(avatar)}
                    >
                        <div className="space-y-2">
                            {/* Show front view as thumbnail */}
                            {avatar.images.length > 0 && (
                                <img
                                    src={`http://localhost:3000${avatar.images[0].url}`}
                                    alt={avatar.name}
                                    className="w-full h-32 object-cover rounded-lg"
                                />
                            )}
                            <div className="space-y-1">
                                <h4 className="font-medium text-sm truncate">{avatar.name}</h4>
                                <div className="text-xs text-gray-500 space-y-1">
                                    <div className="capitalize">{avatar.gender}</div>
                                    <div>{avatar.images.length} views</div>
                                    <div>{new Date(avatar.createdAt).toLocaleDateString()}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
