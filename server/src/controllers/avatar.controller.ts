import { Request, Response } from 'express';
import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Avatar } from '../models';
import { AvatarGenerationRequest, AvatarGenerationResponse, AvatarImage } from '../types';

// Avatar generation endpoints
const OPENAI_URL = "https://api.openai.com/v1/images/generations";
const SDXL_LOCAL_URL = "http://127.0.0.1:8000/generate-multiview-avatar";

const TONE_MAP: Record<string, string> = {
    "fair-cool": "fair cool undertone",
    "light-neutral": "light neutral undertone",
    "medium-warm": "medium warm golden undertone",
    "tan-golden": "tan golden undertone",
    "brown-neutral": "brown neutral undertone",
    "deep-cool": "deep cool undertone",
};

// Ensure uploads directory exists
const UPLOADS_DIR = path.join(process.cwd(), 'uploads', 'avatars');
async function ensureUploadsDir() {
    try {
        await fs.mkdir(UPLOADS_DIR, { recursive: true });
    } catch (error) {
        console.error('Error creating uploads directory:', error);
    }
}

function buildMultiViewPrompts(gender: string, skinTone: string): Record<string, string> {
    const tone = TONE_MAP[skinTone] ?? skinTone;
    const baseDescription = `${gender} adult, ${tone}, neutral facial expression, natural lighting, standing, plain gray seamless backdrop, highly photorealistic, DSLR look, 85mm lens, detailed skin texture, natural hair, minimal neutral clothing`;

    return {
        front: `Full body front view portrait, ${baseDescription}, looking directly at camera, arms at sides, centered composition`,
        side: `Full body side profile view, ${baseDescription}, looking to the side, perfect side angle, arms at sides, centered composition`,
        back: `Full body back view portrait, ${baseDescription}, facing away from camera, showing back and shoulders, arms at sides, centered composition`,
        'three-quarter': `Full body three-quarter view portrait, ${baseDescription}, turned 45 degrees, looking slightly to the side, arms at sides, centered composition`
    };
}

async function saveImageFromBase64(base64Data: string, filename: string): Promise<{ filename: string; size: number; url: string }> {
    // Remove data URL prefix if present
    const base64 = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');
    const buffer = Buffer.from(base64, 'base64');

    const filePath = path.join(UPLOADS_DIR, filename);
    await fs.writeFile(filePath, buffer);

    return {
        filename,
        size: buffer.length,
        url: `/uploads/avatars/${filename}`
    };
}

async function generateMultiViewWithSDXL(gender: string, skinTone: string, seed?: number): Promise<any> {
    try {
        const response = await fetch(SDXL_LOCAL_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                gender,
                skinTone,
                seed: seed || Math.floor(Math.random() * 1000000),
            }),
        });

        console.log(`SDXL generate response status: ${response.status}`);

        if (!response.ok) {
            const errText = await response.text();
            console.log(`SDXL server error response: ${errText}`);
            throw new Error(`SDXL server error: ${response.status} - ${errText}`);
        }

        const data = await response.json() as any;

        if (!data.success) {
            throw new Error(data.error || "SDXL generation failed");
        }

        return data;
    } catch (error) {
        console.error('SDXL generation error:', error);
        throw error;
    }
}

async function generateWithOpenAI(gender: string, skinTone: string, view: string, prompt: string): Promise<any> {
    const response = await fetch(OPENAI_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
            model: "dall-e-3",
            prompt,
            size: "1024x1792", // tall portrait
            quality: "hd",
            n: 1,
            response_format: "b64_json",
        }),
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`OpenAI API error: ${errText}`);
    }

    const data = await response.json() as any;
    const b64 = data?.data?.[0]?.b64_json;

    if (!b64) {
        throw new Error("No image returned from OpenAI");
    }

    return {
        success: true,
        imageDataUrl: `data:image/png;base64,${b64}`,
        view,
        prompt
    };
}

async function checkSDXLAvailable(): Promise<boolean> {
    try {
        const response = await fetch("http://127.0.0.1:8000/health", {
            method: "GET",
            signal: AbortSignal.timeout(2000)
        });

        if (!response.ok) {
            console.log(`SDXL health check failed with status: ${response.status}`);
            return false;
        }

        const data = await response.json() as any;
        const isAvailable = data.status === 'ok' && data.model_loaded;
        console.log(`SDXL server status: ${data.status}, model_loaded: ${data.model_loaded}, available: ${isAvailable}`);
        return isAvailable;
    } catch (error) {
        console.log(`SDXL server connection failed: ${error}`);
        return false;
    }
}

export const generateAvatar = async (req: Request<{}, AvatarGenerationResponse, AvatarGenerationRequest>, res: Response<AvatarGenerationResponse>): Promise<void> => {
    try {
        const { gender, skinTone, size, provider } = req.body;
        const userId = (req as any).user?.id;

        if (!userId) {
            res.status(401).json({
                success: false,
                error: "Authentication required"
            });
            return;
        }

        if (!gender || !skinTone) {
            res.status(400).json({
                success: false,
                error: "gender and skinTone are required"
            });
            return;
        }

        await ensureUploadsDir();

        let images: any[] = [];
        const avatarId = uuidv4();
        const seed = Math.floor(Math.random() * 1000000);

        // Check if user specifically requested a provider
        if (provider === 'sdxl') {
            const sdxlAvailable = await checkSDXLAvailable();
            if (!sdxlAvailable) {
                res.status(500).json({
                    success: false,
                    error: "SDXL server not available. Please ensure the SDXL server is running on port 8000, or use OpenAI by omitting the provider parameter."
                });
                return;
            }

            const result = await generateMultiViewWithSDXL(gender, skinTone, seed);
            images = result.images || [];
        } else {
            // Use OpenAI to generate multiple views
            if (!process.env.OPENAI_API_KEY) {
                res.status(500).json({
                    success: false,
                    error: "OpenAI API key not configured"
                });
                return;
            }

            const prompts = buildMultiViewPrompts(gender, skinTone);
            const views = Object.keys(prompts);

            // Generate all views in parallel
            const generationPromises = views.map(view =>
                generateWithOpenAI(gender, skinTone, view, prompts[view])
            );

            const results = await Promise.all(generationPromises);
            images = results.map(result => ({
                view: result.view,
                imageDataUrl: result.imageDataUrl,
                prompt: result.prompt
            }));
        }

        // Save all generated images to disk
        const savedImages = await Promise.all(
            images.map(async (img, index) => {
                const filename = `${avatarId}_${img.view}_${Date.now()}.png`;
                const savedFile = await saveImageFromBase64(img.imageDataUrl, filename);

                return {
                    id: uuidv4(),
                    view: img.view,
                    url: savedFile.url,
                    filename: savedFile.filename,
                    size: savedFile.size,
                    width: 1024,
                    height: 1792,
                    prompt: img.prompt || `${img.view} view of ${gender} with ${skinTone} skin`
                };
            })
        );

        // Save avatar to database
        const avatar = new Avatar({
            userId,
            name: `${gender} Avatar - ${new Date().toLocaleDateString()}`,
            gender,
            skinTone,
            seed,
            images: savedImages
        });

        await avatar.save();

        res.json({
            success: true,
            avatarId: avatar._id.toString(),
            images: await Promise.all(savedImages.map(async (img) => ({
                view: img.view,
                imageDataUrl: `data:image/png;base64,${await fs.readFile(path.join(UPLOADS_DIR, img.filename), 'base64')}`,
                url: img.url
            }))),
            meta: {
                gender,
                skinTone,
                seed,
                provider: provider || 'openai',
                viewsGenerated: savedImages.length
            }
        });
    } catch (error: any) {
        console.error('Avatar generation error:', error);
        res.status(500).json({
            success: false,
            error: error?.message ?? "Unknown error occurred"
        });
    }
};

export const getUserAvatars = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.id;

        if (!userId) {
            res.status(401).json({
                success: false,
                error: "Authentication required"
            });
            return;
        }

        const avatars = await Avatar.find({ userId }).sort({ createdAt: -1 });

        res.json({
            success: true,
            avatars: avatars.map(avatar => ({
                id: avatar._id,
                name: avatar.name,
                gender: avatar.gender,
                skinTone: avatar.skinTone,
                images: avatar.images.map(img => ({
                    view: img.view,
                    url: img.url
                })),
                createdAt: avatar.createdAt
            }))
        });
    } catch (error: any) {
        console.error('Get user avatars error:', error);
        res.status(500).json({
            success: false,
            error: error?.message ?? "Unknown error occurred"
        });
    }
};

export const getAvatarById = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.id;
        const { avatarId } = req.params;

        if (!userId) {
            res.status(401).json({
                success: false,
                error: "Authentication required"
            });
            return;
        }

        const avatar = await Avatar.findOne({ _id: avatarId, userId });

        if (!avatar) {
            res.status(404).json({
                success: false,
                error: "Avatar not found"
            });
            return;
        }

        // Load base64 data for all images
        const imagesWithData = await Promise.all(
            avatar.images.map(async (img) => {
                try {
                    const base64Data = await fs.readFile(path.join(UPLOADS_DIR, img.filename), 'base64');
                    return {
                        view: img.view,
                        imageDataUrl: `data:image/png;base64,${base64Data}`,
                        url: img.url
                    };
                } catch (error) {
                    console.error(`Error loading image ${img.filename}:`, error);
                    return {
                        view: img.view,
                        imageDataUrl: null,
                        url: img.url
                    };
                }
            })
        );

        res.json({
            success: true,
            avatar: {
                id: avatar._id,
                name: avatar.name,
                gender: avatar.gender,
                skinTone: avatar.skinTone,
                images: imagesWithData,
                createdAt: avatar.createdAt
            }
        });
    } catch (error: any) {
        console.error('Get avatar by ID error:', error);
        res.status(500).json({
            success: false,
            error: error?.message ?? "Unknown error occurred"
        });
    }
};
