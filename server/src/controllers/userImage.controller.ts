import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import { UserImage, User } from '../models';

const USER_UPLOADS_DIR = path.join(process.cwd(), 'uploads', 'user');
const MAX_IMAGES_PER_USER = 2;

async function ensureUserUploadsDir() {
    await fs.mkdir(USER_UPLOADS_DIR, { recursive: true });
}

export const uploadUserImage = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, error: 'Authentication required' });
        }
        const existingCount = await UserImage.countDocuments({ userId });
        // if (existingCount >= MAX_IMAGES_PER_USER) {
        //     return res.status(400).json({ success: false, error: `Image limit (${MAX_IMAGES_PER_USER}) reached` });
        // }

        const { imageDataUrl, type, gender } = req.body as { imageDataUrl: string; type?: 'original' | 'cropped'; gender?: 'male' | 'female' };
        if (!imageDataUrl) {
            return res.status(400).json({ success: false, error: 'imageDataUrl is required' });
        }

        const base64 = imageDataUrl.replace(/^data:image\/[a-zA-Z]+;base64,/, '');
        const buffer = Buffer.from(base64, 'base64');

        await ensureUserUploadsDir();

        const filename = `${uuidv4()}.png`;
        const filepath = path.join(USER_UPLOADS_DIR, filename);
        await fs.writeFile(filepath, buffer);

        const created = await UserImage.create({
            userId,
            filename,
            url: `/uploads/user/${filename}`,
            size: buffer.length,
            type: type || 'original',
            gender
        });

        return res.json({ success: true, filename, image: { id: created._id, url: created.url, filename: created.filename, size: created.size, type: created.type, gender: created.gender, createdAt: created.createdAt } });
    } catch (error: any) {
        console.error('uploadUserImage error', error);
        return res.status(500).json({ success: false, error: error.message || 'Internal server error' });
    }
};

export const attachUserImage = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, error: 'Authentication required' });
        }

        const { filename, gender } = req.body as { filename: string; gender?: 'male' | 'female' };
        if (!filename) {
            return res.status(400).json({ success: false, error: 'filename is required' });
        }

        const img = await UserImage.findOne({ userId, filename });
        if (!img) {
            return res.status(404).json({ success: false, error: 'Image not found for this user' });
        }

        if (!gender) {
            return res.status(400).json({ success: false, error: 'gender is required (male|female)' });
        }

        const update: any = {};
        if (gender === 'male') {
            update.maleAvatarFilename = filename;
        } else if (gender === 'female') {
            update.femaleAvatarFilename = filename;
        }

        const user = await User.findByIdAndUpdate(userId, update, { new: true });
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        return res.json({ success: true, user: user.toUserPayload() });
    } catch (error: any) {
        console.error('attachUserImage error', error);
        return res.status(500).json({ success: false, error: error.message || 'Internal server error' });
    }
};

export const listUserImages = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, error: 'Authentication required' });
        }
        const { gender } = req.query as { gender?: 'male' | 'female' };
        const query: any = { userId };
        if (gender) query.gender = gender;
        const imagesDocs = await UserImage.find(query).sort({ createdAt: -1 }).lean();
        const images = imagesDocs.map(img => ({ id: img._id, url: img.url, type: img.type, filename: img.filename, size: img.size, gender: img.gender, createdAt: img.createdAt }));
        if (gender) {
            return res.json({ success: true, images });
        }
        const grouped = {
            male: images.filter(i => i.gender === 'male'),
            female: images.filter(i => i.gender === 'female')
        };
        return res.json({ success: true, images, grouped });
    } catch (error: any) {
        console.error('listUserImages error', error);
        return res.status(500).json({ success: false, error: error.message || 'Internal server error' });
    }
};

// New: multipart file upload handler
export const uploadUserImageFile = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, error: 'Authentication required' });
        }
        const existingCount = await UserImage.countDocuments({ userId });
        if (existingCount >= MAX_IMAGES_PER_USER) {
            return res.status(400).json({ success: false, error: `Image limit (${MAX_IMAGES_PER_USER}) reached` });
        }
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'image file is required (field name: image)' });
        }
        const { originalname, mimetype, size, buffer } = req.file as Express.Multer.File;
        if (!mimetype.startsWith('image/')) {
            return res.status(400).json({ success: false, error: 'Only image uploads are allowed' });
        }
        const { gender } = req.body as { gender?: 'male' | 'female' };
        await ensureUserUploadsDir();
        const ext = path.extname(originalname) || '.png';
        const filename = `${uuidv4()}${ext}`;
        const filepath = path.join(USER_UPLOADS_DIR, filename);
        await fs.writeFile(filepath, buffer);
        const created = await UserImage.create({
            userId,
            filename,
            url: `/uploads/user/${filename}`,
            size,
            type: 'original',
            gender
        });
        return res.json({ success: true, filename, url: `/uploads/user/${filename}`, image: { id: created._id, url: created.url, filename: created.filename, size: created.size, type: created.type, gender: created.gender, createdAt: created.createdAt } });
    } catch (error: any) {
        console.error('uploadUserImageFile error', error);
        return res.status(500).json({ success: false, error: error.message || 'Internal server error' });
    }
};

export const deleteUserImage = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        if (!userId) return res.status(401).json({ success: false, error: 'Authentication required' });
        const { id } = req.params; // image document id
        const img = await UserImage.findOne({ _id: id, userId });
        if (!img) return res.status(404).json({ success: false, error: 'Image not found' });
        // remove file
        try { await fs.unlink(path.join(USER_UPLOADS_DIR, img.filename)); } catch { /* ignore */ }
        await img.deleteOne();

        // Clear male/female avatar filename if matches
        const clear: any = {};
        const userDoc = await User.findById(userId);
        if (userDoc) {
            if (userDoc.maleAvatarFilename === img.filename) clear.maleAvatarFilename = null;
            if (userDoc.femaleAvatarFilename === img.filename) clear.femaleAvatarFilename = null;
            if (Object.keys(clear).length) {
                await User.findByIdAndUpdate(userId, clear);
            }
        }
        return res.json({ success: true, deletedId: id });
    } catch (error: any) {
        console.error('deleteUserImage error', error);
        return res.status(500).json({ success: false, error: error.message || 'Internal server error' });
    }
};
