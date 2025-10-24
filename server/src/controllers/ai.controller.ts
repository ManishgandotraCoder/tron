import { Request, Response } from 'express';
import { AISession, IAISession, IAIMessage } from '../models/AISession.model';
import { AuthenticatedRequest } from '../types/express';
import { createAIService } from '../services/ai.service';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../../uploads');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        // Allow images and common document types
        const allowedTypes = /jpeg|jpg|png|gif|webp|pdf|doc|docx|txt|csv|xlsx/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Invalid file type'));
        }
    }
});

export const uploadMiddleware = upload;

// Get all AI sessions for a user
export const getAllSessions = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const sessions = await AISession.find({ userId })
            .sort({ updatedAt: -1 })
            .lean();

        // Transform data to match client interface
        const transformedSessions = sessions.map(session => ({
            id: session._id.toString(),
            name: session.name,
            model: session.aiModel,
            createdAt: session.createdAt,
            updatedAt: session.updatedAt,
            messages: session.messages || []
        }));

        res.json({ sessions: transformedSessions });
    } catch (error) {
        console.error('Error fetching AI sessions:', error);
        res.status(500).json({ error: 'Failed to fetch sessions' });
    }
};

// Create a new AI session
export const createSession = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { name, model } = req.body;

        if (!name || !model) {
            return res.status(400).json({ error: 'Name and model are required' });
        }

        const newSession = new AISession({
            userId,
            name: name.trim(),
            aiModel: model,
            messages: []
        });

        const savedSession = await newSession.save();

        // Transform data to match client interface
        const transformedSession = {
            id: savedSession._id.toString(),
            name: savedSession.name,
            model: savedSession.aiModel,
            createdAt: savedSession.createdAt,
            updatedAt: savedSession.updatedAt,
            messages: savedSession.messages || []
        };

        res.status(201).json(transformedSession);
    } catch (error) {
        console.error('Error creating AI session:', error);
        res.status(500).json({ error: 'Failed to create session' });
    }
};

// Update an existing AI session
export const updateSession = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { sessionId } = req.params;
        const sessionData = req.body;

        const session = await AISession.findOne({ _id: sessionId, userId });
        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        // Update session with new data
        session.name = sessionData.name || session.name;
        session.aiModel = sessionData.model || session.aiModel;
        session.messages = sessionData.messages || session.messages;
        session.updatedAt = new Date();

        const updatedSession = await session.save();

        // Transform data to match client interface
        const transformedSession = {
            id: updatedSession._id.toString(),
            name: updatedSession.name,
            model: updatedSession.aiModel,
            createdAt: updatedSession.createdAt,
            updatedAt: updatedSession.updatedAt,
            messages: updatedSession.messages || []
        };

        res.json(transformedSession);
    } catch (error) {
        console.error('Error updating AI session:', error);
        res.status(500).json({ error: 'Failed to update session' });
    }
};

// Delete an AI session
export const deleteSession = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { sessionId } = req.params;

        const deletedSession = await AISession.findOneAndDelete({ _id: sessionId, userId });
        if (!deletedSession) {
            return res.status(404).json({ error: 'Session not found' });
        }

        // TODO: Delete associated uploaded files
        // This should be implemented to clean up uploaded images and attachments

        res.json({ message: 'Session deleted successfully' });
    } catch (error) {
        console.error('Error deleting AI session:', error);
        res.status(500).json({ error: 'Failed to delete session' });
    }
};

// Upload image
export const uploadImage = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }

        // Validate file is an image
        if (!req.file.mimetype.startsWith('image/')) {
            return res.status(400).json({ error: 'File must be an image' });
        }

        const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3001}`;
        const imageUrl = `${baseUrl}/uploads/${req.file.filename}`;

        res.json({
            url: imageUrl,
            filename: req.file.originalname,
            size: req.file.size,
            mimeType: req.file.mimetype
        });
    } catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).json({ error: 'Failed to upload image' });
    }
};

// Upload attachment
export const uploadAttachment = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'No file provided' });
        }

        const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3001}`;
        const fileUrl = `${baseUrl}/uploads/${req.file.filename}`;

        res.json({
            url: fileUrl,
            filename: req.file.originalname,
            size: req.file.size,
            mimeType: req.file.mimetype
        });
    } catch (error) {
        console.error('Error uploading attachment:', error);
        res.status(500).json({ error: 'Failed to upload attachment' });
    }
};

// Send message to AI without session (supports FormData with images)
export const sendMessage = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Handle both JSON and FormData
        let message: string;
        let model: string = 'gpt-3.5-turbo';
        let images: any[] = [];
        let attachments: any[] = [];

        console.log('Request body:', req.body);
        console.log('Request files:', req.files);

        // Check if request has files (FormData) or is FormData without files
        if (req.files && Array.isArray(req.files) && req.files.length > 0) {
            // FormData request with files
            message = req.body.message || req.body.content;
            model = req.body.model || 'gpt-3.5-turbo';

            // Process uploaded files
            const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3001}`;

            for (const file of req.files) {
                const fileUrl = `${baseUrl}/uploads/${file.filename}`;
                const fileData = {
                    url: fileUrl,
                    filename: file.originalname,
                    size: file.size,
                    mimeType: file.mimetype
                };

                if (file.mimetype.startsWith('image/')) {
                    images.push(fileData);
                } else {
                    attachments.push(fileData);
                }
            }
        } else if (req.headers['content-type']?.includes('multipart/form-data')) {
            // FormData request without files
            message = req.body.message || req.body.content;
            model = req.body.model || 'gpt-3.5-turbo';
            // Parse existing images/attachments from FormData if provided as JSON strings
            try {
                images = req.body.images ? JSON.parse(req.body.images) : [];
                attachments = req.body.attachments ? JSON.parse(req.body.attachments) : [];
            } catch {
                images = [];
                attachments = [];
            }
        } else {
            // JSON request
            const bodyData = req.body;
            message = bodyData.message || bodyData.content;
            model = bodyData.model || 'gpt-3.5-turbo';
            images = bodyData.images || [];
            attachments = bodyData.attachments || [];
        }

        if (!message) {
            return res.status(400).json({
                error: 'Message is required',
                receivedBody: req.body,
                contentType: req.headers['content-type']
            });
        }

        // Create temporary messages array for AI processing
        const messages: IAIMessage[] = [{
            id: Date.now().toString(),
            content: message,
            role: 'user',
            timestamp: new Date(),
            images: images,
            attachments: attachments
        }];

        // Generate AI response using the AI service
        const aiService = createAIService(model);
        const imageUrls = images?.map((img: any) => img.url) || [];
        const attachmentUrls = attachments?.map((att: any) => att.url) || [];

        const aiResponse = await aiService.generateResponse(
            messages,
            message,
            imageUrls,
            attachmentUrls
        );

        // Return the AI response
        res.json({
            message: aiResponse.content,
            model: model,
            timestamp: new Date(),
            uploadedImages: images,
            uploadedAttachments: attachments
        });
    } catch (error) {
        console.error('Error sending message to AI:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
};

// Send message to AI with session (supports FormData with images)
export const sendMessageToAI = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { sessionId } = req.params;

        // Handle both JSON and FormData
        let message: string;
        let images: any[] = [];
        let attachments: any[] = [];

        console.log('Session request body:', req.body);
        console.log('Session request files:', req.files);

        // Check if request has files (FormData) or is FormData without files
        if (req.files && Array.isArray(req.files) && req.files.length > 0) {
            // FormData request with files
            message = req.body.message || req.body.content;

            // Process uploaded files
            const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3001}`;

            for (const file of req.files) {
                const fileUrl = `${baseUrl}/uploads/${file.filename}`;
                const fileData = {
                    url: fileUrl,
                    filename: file.originalname,
                    size: file.size,
                    mimeType: file.mimetype
                };

                if (file.mimetype.startsWith('image/')) {
                    images.push(fileData);
                } else {
                    attachments.push(fileData);
                }
            }
        } else if (req.headers['content-type']?.includes('multipart/form-data')) {
            // FormData request without files
            message = req.body.message || req.body.content;
            // Parse existing images/attachments from FormData if provided as JSON strings
            try {
                images = req.body.images ? JSON.parse(req.body.images) : [];
                attachments = req.body.attachments ? JSON.parse(req.body.attachments) : [];
            } catch {
                images = [];
                attachments = [];
            }
        } else {
            // JSON request
            const bodyData = req.body;
            message = bodyData.message || bodyData.content;
            images = bodyData.images || [];
            attachments = bodyData.attachments || [];
        }

        if (!message) {
            return res.status(400).json({
                error: 'Message is required',
                receivedBody: req.body,
                contentType: req.headers['content-type']
            });
        }

        const session = await AISession.findOne({ _id: sessionId, userId });
        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        // Create user message
        const userMessage: IAIMessage = {
            id: Date.now().toString(),
            content: message,
            role: 'user',
            timestamp: new Date(),
            images: images,
            attachments: attachments
        };

        // Add user message to session
        session.messages.push(userMessage);

        // Generate AI response using the AI service
        const aiService = createAIService(session.aiModel);
        const imageUrls = images?.map((img: any) => img.url) || [];
        const attachmentUrls = attachments?.map((att: any) => att.url) || [];

        const aiResponse = await aiService.generateResponse(
            session.messages,
            message,
            imageUrls,
            attachmentUrls
        );

        // Create AI response message
        const aiMessage: IAIMessage = {
            id: (Date.now() + 1).toString(),
            content: aiResponse.content,
            role: 'assistant',
            timestamp: new Date()
        };

        // Add AI response to session
        session.messages.push(aiMessage);
        session.updatedAt = new Date();

        const updatedSession = await session.save();

        // Return the AI response
        res.json({
            message: aiMessage,
            session: {
                id: updatedSession._id.toString(),
                name: updatedSession.name,
                model: updatedSession.aiModel,
                createdAt: updatedSession.createdAt,
                updatedAt: updatedSession.updatedAt,
                messages: updatedSession.messages
            }
        });
    } catch (error) {
        console.error('Error sending message to AI:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
};
