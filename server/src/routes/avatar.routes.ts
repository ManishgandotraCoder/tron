import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth.middleware';
import { generateAvatar, getUserAvatars, getAvatarById } from '../controllers/avatar.controller';

const router = Router();

router.post('/generate-avatar', authenticateToken, generateAvatar);
router.get('/avatars', authenticateToken, getUserAvatars);
router.get('/avatars/:avatarId', authenticateToken, getAvatarById);

export default router;
