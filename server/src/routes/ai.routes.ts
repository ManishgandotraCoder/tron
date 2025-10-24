import { Router } from 'express';
import {
    getAllSessions,
    createSession,
    updateSession,
    deleteSession,
    uploadImage,
    uploadAttachment,
    sendMessage,
    sendMessageToAI,
    uploadMiddleware
} from '../controllers/ai.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

// Apply authentication middleware to all AI routes
router.use(authenticateToken);

// Session routes
router.get('/sessions', getAllSessions);
router.post('/sessions', createSession);
router.put('/sessions/:sessionId', updateSession);
router.delete('/sessions/:sessionId', deleteSession);

// Upload routes
router.post('/upload/image', uploadMiddleware.single('image'), uploadImage);
router.post('/upload/attachment', uploadMiddleware.single('attachment'), uploadAttachment);

// AI interaction routes
router.post('/message', uploadMiddleware.array('files', 10), sendMessage);
router.post('/sessions/:sessionId/message', uploadMiddleware.array('files', 10), sendMessageToAI);

export default router;
