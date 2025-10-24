'use client';

import { useState, useCallback, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import Modal from '../../components/Modal';
import { useListUserImagesQuery } from '../../store/api/aiApi';

interface CroppedAreaPixels { width: number; height: number; x: number; y: number; }
interface Area { x: number; y: number; width: number; height: number; }

interface GetCroppedImageOptions { circle?: boolean }

async function getCroppedImage(dataUrl: string, crop: CroppedAreaPixels, options: GetCroppedImageOptions = {}): Promise<Blob> {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = dataUrl;
    });
    const canvas = document.createElement('canvas');
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context not found');

    if (options.circle) {
        // Make the canvas transparent outside a circular clipping path
        ctx.save();
        ctx.beginPath();
        const radius = Math.min(crop.width, crop.height) / 2;
        ctx.arc(crop.width / 2, crop.height / 2, radius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
    }

    ctx.drawImage(
        image,
        crop.x, crop.y, crop.width, crop.height,
        0, 0, crop.width, crop.height
    );

    if (options.circle) {
        ctx.restore();
    }

    return await new Promise<Blob>((resolve) => canvas.toBlob(b => resolve(b as Blob), 'image/png'));
}

export default function AvatarPage() {
    const [selectedSex, setSelectedSex] = useState<'male' | 'female' | ''>('');
    const [editingSex, setEditingSex] = useState<'male' | 'female' | ''>('');
    const [imageSrc, setImageSrc] = useState<string>('');
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<CroppedAreaPixels | null>(null);
    const [showPanel, setShowPanel] = useState(false);
    const [saving, setSaving] = useState(false);

    // Dynamic aspect & shape state
    const [shape, setShape] = useState<'square' | 'circle' | 'portrait' | 'landscape' | 'free'>('square');
    const [aspect, setAspect] = useState<number | undefined>(1);

    // Store updated avatar previews
    const [maleAvatar, setMaleAvatar] = useState('/male_ai.png');
    const [femaleAvatar, setFemaleAvatar] = useState('/female_ai.png');
    const [loadingAvatars, setLoadingAvatars] = useState(true);

    const { data: userImagesData, isFetching: imagesLoading } = useListUserImagesQuery();
    const maleImages = userImagesData?.grouped?.male || [];
    const femaleImages = userImagesData?.grouped?.female || [];

    const handleSelect = (sex: 'male' | 'female') => setSelectedSex(sex);

    const onCropComplete = useCallback((_: Area, croppedPixels: CroppedAreaPixels) => {
        setCroppedAreaPixels(croppedPixels);
    }, []);

    const handleEdit = (sex: 'male' | 'female') => {
        setEditingSex(sex);
        setShowPanel(true);
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => { setImageSrc(reader.result as string); };
        reader.readAsDataURL(file);
    };

    const closePanel = () => {
        setShowPanel(false);
        setEditingSex('');
        setImageSrc('');
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setCroppedAreaPixels(null);
        setSaving(false);
        setShape('square');
        setAspect(1);
    };

    // Map shape -> aspect ratio
    useEffect(() => {
        switch (shape) {
            case 'square':
            case 'circle':
                setAspect(1); break;
            case 'portrait':
                setAspect(3 / 4); break; // 3:4
            case 'landscape':
                setAspect(16 / 9); break; // 16:9
            case 'free':
                setAspect(undefined); break; // unrestricted
            default:
                setAspect(1);
        }
    }, [shape]);

    const handleCropSave = async () => {
        if (!imageSrc || !croppedAreaPixels || !editingSex) return;
        try {
            setSaving(true);
            const blob = await getCroppedImage(imageSrc, croppedAreaPixels, { circle: shape === 'circle' });
            // Convert blob to base64 data URL
            const base64DataUrl = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(blob);
            });

            // Prepare auth header
            const token = localStorage.getItem('token');
            const authHeaders: Record<string, string> = {
                'Content-Type': 'application/json'
            };
            if (token) authHeaders['Authorization'] = `Bearer ${token}`;

            // Upload cropped (type=cropped)
            const uploadRes = await fetch('/api/user-images/upload', {
                method: 'POST',
                headers: authHeaders,
                body: JSON.stringify({ imageDataUrl: base64DataUrl, type: 'cropped' })
            });
            const uploadJson = await uploadRes.json();
            if (!uploadJson.success) throw new Error(uploadJson.error || 'Upload failed');
            const { filename } = uploadJson;

            // Attach to user (male/female specific)
            await fetch('/api/user-images/attach', {
                method: 'POST',
                headers: authHeaders,
                body: JSON.stringify({ filename, gender: editingSex })
            });

            // Update local preview
            const newUrl = `/uploads/user/${filename}`;
            if (editingSex === 'male') setMaleAvatar(newUrl);
            if (editingSex === 'female') setFemaleAvatar(newUrl);
        } catch (err) {
            console.error(err);
        } finally {
            closePanel();
        }
    };

    // Escape close & scroll lock
    useEffect(() => {
        if (!showPanel) return;
        const original = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closePanel(); };
        window.addEventListener('keydown', handleKey);
        return () => {
            document.body.style.overflow = original;
            window.removeEventListener('keydown', handleKey);
        };
    }, [showPanel]);

    // Fetch existing user avatar filenames on mount
    useEffect(() => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (!token) { setLoadingAvatars(false); return; }
        (async () => {
            try {
                const res = await fetch('/api/user/profile', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const json = await res.json();
                const user = json?.data?.user;
                if (user) {
                    if (user.maleAvatarFilename) setMaleAvatar(`/uploads/user/${user.maleAvatarFilename}`);
                    if (user.femaleAvatarFilename) setFemaleAvatar(`/uploads/user/${user.femaleAvatarFilename}`);
                }
            } catch (e) {
                console.error('Failed to load user avatars', e);
            } finally {
                setLoadingAvatars(false);
            }
        })();
    }, []);

    return (
        <div className="mt-10 flex flex-col items-center justify-start relative overflow-visible px-4 sm:px-6 lg:px-8 w-full">
            {/* Loading indicator for initial avatar fetch */}
            {loadingAvatars && (
                <div className="mb-4 text-xs text-gray-500 animate-pulse">Loading avatars...</div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white rounded-lg shadow-lg p-4 w-full max-w-3xl">
                {/* Male Avatar */}
                <div
                    className={`relative p-2 rounded-md cursor-pointer transition ring-offset-2 ${selectedSex === 'male' ? 'ring-2 ring-blue-500' : 'hover:ring-1 hover:ring-gray-300'}`}
                    onClick={() => handleSelect('male')}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && handleSelect('male')}
                    aria-label="Select male avatar"
                >
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleEdit('male'); }}
                        aria-label="Edit male avatar"
                        className="absolute top-2 right-2 bg-white/80 hover:bg-white rounded-full p-1 shadow transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                            <path d="M12 20h9" />
                            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                        </svg>
                    </button>
                    <img src={maleAvatar} alt="Male avatar image for user" className="w-full h-auto rounded object-cover" />
                    <p className="mt-2 text-center text-sm font-medium text-gray-700">Male</p>
                    {maleAvatar === '/male_ai.png' && !loadingAvatars && (
                        <p className="text-[10px] mt-1 text-center text-gray-400">No custom male avatar yet</p>
                    )}
                    {imagesLoading && <p className="text-[10px] mt-1 text-center text-gray-400">Loading...</p>}
                    {!imagesLoading && maleImages.length ? (
                        <div className="mt-2 grid grid-cols-3 gap-1">
                            {maleImages.slice(0, 3).map(img => (
                                <img key={img.id} src={img.url} alt="male prev" className="w-full h-10 object-cover rounded" />
                            ))}
                        </div>
                    ) : null}
                </div>

                {/* Female Avatar */}
                <div
                    className={`relative p-2 rounded-md cursor-pointer transition ring-offset-2 ${selectedSex === 'female' ? 'ring-2 ring-pink-500' : 'hover:ring-1 hover:ring-gray-300'}`}
                    onClick={() => handleSelect('female')}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && handleSelect('female')}
                    aria-label="Select female avatar"
                >
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleEdit('female'); }}
                        aria-label="Edit female avatar"
                        className="absolute top-2 right-2 bg-white/80 hover:bg-white rounded-full p-1 shadow transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                            <path d="M12 20h9" />
                            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                        </svg>
                    </button>
                    <img src={femaleAvatar} alt="Female avatar image for user" className="w-full h-auto rounded object-cover" />
                    <p className="mt-2 text-center text-sm font-medium text-gray-700">Female</p>
                    {femaleAvatar === '/female_ai.png' && !loadingAvatars && (
                        <p className="text-[10px] mt-1 text-center text-gray-400">No custom female avatar yet</p>
                    )}
                    {imagesLoading && <p className="text-[10px] mt-1 text-center text-gray-400">Loading...</p>}
                    {!imagesLoading && femaleImages.length ? (
                        <div className="mt-2 grid grid-cols-3 gap-1">
                            {femaleImages.slice(0, 3).map(img => (
                                <img key={img.id} src={img.url} alt="female prev" className="w-full h-10 object-cover rounded" />
                            ))}
                        </div>
                    ) : null}
                </div>
            </div>

            <Modal
                open={showPanel}
                onClose={closePanel}
                title={`Upload & Crop ${editingSex} Image`}
                size="lg"
                disableClose={saving}
                actions={imageSrc && (
                    <>
                        <button
                            onClick={closePanel}
                            className="text-xs px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                            disabled={saving}
                        >Cancel</button>
                        <button
                            onClick={handleCropSave}
                            className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
                            disabled={saving || !croppedAreaPixels}
                        >{saving ? 'Saving...' : 'Save'}</button>
                    </>
                )}
            >
                {!imageSrc && (
                    <div className="border border-dashed rounded-lg p-6 text-center">
                        <p className="text-xs text-gray-500 mb-2">Choose an image (JPG/PNG)</p>
                        <input type="file" accept="image/*" onChange={handleFileChange} className="text-xs" />
                    </div>
                )}
                {imageSrc && (
                    <div className="flex flex-col gap-4">
                        {/* Shape selector */}
                        <div className="flex flex-wrap gap-2 text-xs">
                            {['square', 'circle', 'portrait', 'landscape', 'free'].map(s => (
                                <button
                                    key={s}
                                    type="button"
                                    onClick={() => setShape(s as 'square' | 'circle' | 'portrait' | 'landscape' | 'free')}
                                    className={`px-2 py-1 rounded border ${shape === s ? 'bg-blue-600 text-white border-blue-600' : 'bg-white hover:bg-gray-50 border-gray-300'}`}
                                >{s}</button>
                            ))}
                        </div>
                        <div className="relative w-full h-64 sm:h-80 bg-gray-100 rounded overflow-hidden">
                            <Cropper
                                image={imageSrc}
                                crop={crop}
                                zoom={zoom}
                                aspect={aspect}
                                onCropChange={setCrop}
                                onZoomChange={setZoom}
                                onCropComplete={onCropComplete}
                                showGrid={false}
                            />
                            {shape === 'circle' && (
                                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                                    {/* Circular overlay mask */}
                                    <div className="w-[60%] h-[60%] rounded-full border-2 border-white/70 shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]" />
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-4">
                            <label className="text-xs text-gray-600">Zoom</label>
                            <input
                                type="range"
                                min={1}
                                max={3}
                                step={0.1}
                                value={zoom}
                                onChange={(e) => setZoom(Number(e.target.value))}
                                className="flex-1"
                            />
                        </div>
                        {shape === 'free' && <p className="text-[10px] text-gray-500">Free aspect: drag corners to any size.</p>}
                    </div>
                )}
            </Modal>
        </div>
    );
}
