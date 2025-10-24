import { Router } from 'express';
import multer from 'multer';
import { authenticateToken } from '../middlewares/auth.middleware';
import { uploadUserImage, listUserImages, attachUserImage, uploadUserImageFile, deleteUserImage } from '../controllers/userImage.controller';

const router = Router();
const upload = multer({ limits: { fileSize: 25 * 1024 * 1024 } });

// Backward compatible base64 upload (old endpoint expected by client)
router.post('/user-images', authenticateToken, uploadUserImage);
// Explicit base64 upload endpoint
router.post('/user-images/upload', authenticateToken, uploadUserImage); // base64 -> filename
// Multipart file upload
router.post('/user-images/upload-file', authenticateToken, upload.single('image'), uploadUserImageFile); // multipart
// Attach previously uploaded filename to user profile
router.post('/user-images/attach', authenticateToken, attachUserImage); // attach filename to user
// List images
router.get('/user-images', authenticateToken, listUserImages);
// Delete image
router.delete('/user-images/:id', authenticateToken, deleteUserImage);

export default router;
