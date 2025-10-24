// Local SDXL avatar generation utility
export interface LocalAvatarOptions {
    gender: 'male' | 'female';
    skinTone: string;
    seed?: number;
    width?: number;
    height?: number;
    steps?: number;
    guidance_scale?: number;
}

export interface LocalAvatarResponse {
    success: boolean;
    imageDataUrl?: string;
    meta?: {
        prompt: string;
        device: string;
        model: string;
    };
    error?: string;
}

const SDXL_SERVER_URL = 'http://127.0.0.1:8000';

export async function generateLocalAvatar(opts: LocalAvatarOptions): Promise<string> {
    const response = await fetch(`${SDXL_SERVER_URL}/generate-avatar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            gender: opts.gender,
            skinTone: opts.skinTone,
            seed: opts.seed ?? Math.floor(Math.random() * 1000000),
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`SDXL server error: ${errorText}`);
    }

    const data: LocalAvatarResponse = await response.json();

    if (!data.success || !data.imageDataUrl) {
        throw new Error(data.error || 'Failed to generate avatar');
    }

    return data.imageDataUrl;
}

export async function generateLocalImage(opts: {
    prompt: string;
    negative_prompt?: string;
    width?: number;
    height?: number;
    steps?: number;
    guidance_scale?: number;
    seed?: number;
}): Promise<string> {
    const response = await fetch(`${SDXL_SERVER_URL}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            prompt: opts.prompt,
            negative_prompt: opts.negative_prompt,
            width: opts.width ?? 832,
            height: opts.height ?? 1216,
            steps: opts.steps ?? 28,
            guidance_scale: opts.guidance_scale ?? 5.5,
            seed: opts.seed ?? Math.floor(Math.random() * 1000000),
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`SDXL server error: ${errorText}`);
    }

    const data = await response.json();
    return data.imageDataUrl;
}

export async function checkSDXLServerHealth(): Promise<boolean> {
    try {
        const response = await fetch(`${SDXL_SERVER_URL}/health`);
        const data = await response.json();
        return data.status === 'ok' && data.model_loaded;
    } catch {
        return false;
    }
}
