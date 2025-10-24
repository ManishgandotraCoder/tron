import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import type { RootState } from '../store';
import {
    useGetSessionsQuery,
    useCreateSessionMutation,
    useDeleteSessionMutation,
    useUpdateSessionMutation,
    useSendMessageMutation,
    useUploadImageMutation,
    useUploadAttachmentMutation,
    type AIMessage,
    type AIMessageImage,
    type AIMessageAttachment,
} from '../store/api/aiApi';
import {
    setCurrentSession,
    setSelectedModel,
    setMessageInput,
    setSelectedImages,
    setSelectedAttachments,
    setPreviewImages,
    setShowNewSessionForm,
    setShowImageModal,
    setModalImageUrl,
    setNewSessionName,
    clearMessageForm,
    clearNewSessionForm,
    addMessageToCurrentSession,
    updateMessageInCurrentSession,
    removeMessageFromCurrentSession,
} from '../store/slices/aiSlice';

export const useReduxAI = () => {
    const dispatch = useDispatch();

    // Redux state
    const {
        currentSession,
        selectedModel,
        messageInput,
        selectedImages,
        selectedAttachments,
        previewImages,
        showNewSessionForm,
        showImageModal,
        modalImageUrl,
        newSessionName,
    } = useSelector((state: RootState) => state.ai);

    // API hooks
    const { data: sessionsData, isLoading: loadingSessions, error: sessionsError } = useGetSessionsQuery();
    const [createSessionMutation, { isLoading: creatingSession }] = useCreateSessionMutation();
    const [deleteSessionMutation, { isLoading: deletingSession }] = useDeleteSessionMutation();
    const [updateSessionMutation, { isLoading: updatingSession }] = useUpdateSessionMutation();
    const [sendMessageMutation, { isLoading: sendingMessage }] = useSendMessageMutation();
    const [uploadImageMutation, { isLoading: uploadingImage }] = useUploadImageMutation();
    const [uploadAttachmentMutation, { isLoading: uploadingAttachment }] = useUploadAttachmentMutation();

    const sessions = sessionsData?.sessions || [];
    const loading = loadingSessions || creatingSession || deletingSession || updatingSession || sendingMessage;
    const uploading = uploadingImage || uploadingAttachment;

    // Actions
    const handleSetCurrentSession = useCallback((session: typeof currentSession) => {
        dispatch(setCurrentSession(session));
    }, [dispatch]);

    const handleSetSelectedModel = useCallback((model: string) => {
        dispatch(setSelectedModel(model));
    }, [dispatch]);

    const handleSetMessageInput = useCallback((input: string) => {
        dispatch(setMessageInput(input));
    }, [dispatch]);

    const handleSetSelectedImages = useCallback((images: File[]) => {
        dispatch(setSelectedImages(images));

        // Create preview URLs
        const previews = images.map(file => URL.createObjectURL(file));
        dispatch(setPreviewImages(previews));
    }, [dispatch]);

    const handleSetSelectedAttachments = useCallback((attachments: File[]) => {
        dispatch(setSelectedAttachments(attachments));
    }, [dispatch]);

    const handleSetShowNewSessionForm = useCallback((show: boolean) => {
        dispatch(setShowNewSessionForm(show));
    }, [dispatch]);

    const handleSetShowImageModal = useCallback((show: boolean) => {
        dispatch(setShowImageModal(show));
    }, [dispatch]);

    const handleSetModalImageUrl = useCallback((url: string) => {
        dispatch(setModalImageUrl(url));
    }, [dispatch]);

    const handleSetNewSessionName = useCallback((name: string) => {
        dispatch(setNewSessionName(name));
    }, [dispatch]);

    const createSession = useCallback(async (name: string, model: string): Promise<boolean> => {
        try {
            const result = await createSessionMutation({ name, model }).unwrap();
            dispatch(setCurrentSession(result));
            dispatch(clearNewSessionForm());
            return true;
        } catch (error) {
            console.error('Create session error:', error);
            return false;
        }
    }, [createSessionMutation, dispatch]);

    const deleteSession = useCallback(async (sessionId: string): Promise<boolean> => {
        try {
            await deleteSessionMutation(sessionId).unwrap();
            if (currentSession?.id === sessionId) {
                dispatch(setCurrentSession(null));
            }
            return true;
        } catch (error) {
            console.error('Delete session error:', error);
            return false;
        }
    }, [deleteSessionMutation, currentSession?.id, dispatch]);

    const uploadImage = useCallback(async (file: File): Promise<string | null> => {
        try {
            const result = await uploadImageMutation(file).unwrap();
            return result.url;
        } catch (error) {
            console.error('Image upload error:', error);
            return null;
        }
    }, [uploadImageMutation]);

    const uploadAttachment = useCallback(async (file: File): Promise<string | null> => {
        try {
            const result = await uploadAttachmentMutation(file).unwrap();
            return result.url;
        } catch (error) {
            console.error('Attachment upload error:', error);
            return null;
        }
    }, [uploadAttachmentMutation]);

    const sendMessage = useCallback(async (
        content: string,
        images?: File[],
        attachments?: File[]
    ): Promise<boolean> => {
        if (!currentSession) return false;

        try {
            // Upload images if provided
            const uploadedImages: AIMessageImage[] = [];
            if (images && images.length > 0) {
                for (const image of images) {
                    const imageUrl = await uploadImage(image);
                    if (imageUrl) {
                        uploadedImages.push({
                            id: Date.now().toString() + Math.random(),
                            url: imageUrl,
                            filename: image.name,
                            size: image.size,
                            mimeType: image.type,
                        });
                    }
                }
            }

            // Upload attachments if provided
            const uploadedAttachments: AIMessageAttachment[] = [];
            if (attachments && attachments.length > 0) {
                for (const attachment of attachments) {
                    const attachmentUrl = await uploadAttachment(attachment);
                    if (attachmentUrl) {
                        uploadedAttachments.push({
                            id: Date.now().toString() + Math.random(),
                            url: attachmentUrl,
                            filename: attachment.name,
                            size: attachment.size,
                            mimeType: attachment.type,
                        });
                    }
                }
            }

            // Create user message
            const userMessage: AIMessage = {
                id: Date.now().toString(),
                content,
                role: 'user',
                timestamp: new Date(),
                images: uploadedImages.length > 0 ? uploadedImages : undefined,
                attachments: uploadedAttachments.length > 0 ? uploadedAttachments : undefined,
            };

            // Add user message to current session
            dispatch(addMessageToCurrentSession(userMessage));

            // Send message to AI service
            const aiResponse = await sendMessageMutation({
                sessionId: currentSession.id,
                content,
                images,
                attachments,
            }).unwrap();

            // Add AI response to current session
            dispatch(addMessageToCurrentSession(aiResponse));

            // Clear form
            dispatch(clearMessageForm());

            return true;
        } catch (error) {
            console.error('Send message error:', error);
            return false;
        }
    }, [currentSession, uploadImage, uploadAttachment, sendMessageMutation, dispatch]);

    const deleteMessage = useCallback(async (messageId: string): Promise<boolean> => {
        if (!currentSession) return false;

        try {
            const updatedSession = {
                ...currentSession,
                messages: currentSession.messages.filter((msg: AIMessage) => msg.id !== messageId),
                updatedAt: new Date(),
            };

            await updateSessionMutation({
                sessionId: currentSession.id,
                session: updatedSession,
            }).unwrap();

            dispatch(removeMessageFromCurrentSession(messageId));
            return true;
        } catch (error) {
            console.error('Delete message error:', error);
            return false;
        }
    }, [currentSession, updateSessionMutation, dispatch]);

    const editMessage = useCallback(async (messageId: string, newContent: string): Promise<boolean> => {
        if (!currentSession) return false;

        try {
            const updatedSession = {
                ...currentSession,
                messages: currentSession.messages.map((msg: AIMessage) =>
                    msg.id === messageId ? { ...msg, content: newContent } : msg
                ),
                updatedAt: new Date(),
            };

            await updateSessionMutation({
                sessionId: currentSession.id,
                session: updatedSession,
            }).unwrap();

            dispatch(updateMessageInCurrentSession({ messageId, content: newContent }));
            return true;
        } catch (error) {
            console.error('Edit message error:', error);
            return false;
        }
    }, [currentSession, updateSessionMutation, dispatch]);

    const regenerateResponse = useCallback(async (messageId: string): Promise<boolean> => {
        if (!currentSession) return false;

        try {
            // Find the message and regenerate AI response
            const messageIndex = currentSession.messages.findIndex((msg: AIMessage) => msg.id === messageId);
            if (messageIndex === -1) return false;

            const userMessage = currentSession.messages[messageIndex - 1];
            if (!userMessage || userMessage.role !== 'user') return false;

            // Generate new response (this would call the AI service)
            const newAiMessage: AIMessage = {
                id: Date.now().toString(),
                content: `This is a regenerated AI response to: "${userMessage.content}".`,
                role: 'assistant',
                timestamp: new Date(),
            };

            const updatedSession = {
                ...currentSession,
                messages: currentSession.messages.map((msg: AIMessage) =>
                    msg.id === messageId ? newAiMessage : msg
                ),
                updatedAt: new Date(),
            };

            await updateSessionMutation({
                sessionId: currentSession.id,
                session: updatedSession,
            }).unwrap();

            dispatch(updateMessageInCurrentSession({ messageId, content: newAiMessage.content }));
            return true;
        } catch (error) {
            console.error('Regenerate response error:', error);
            return false;
        }
    }, [currentSession, updateSessionMutation, dispatch]);

    return {
        // Data
        sessions,
        currentSession,
        selectedModel,
        messageInput,
        selectedImages,
        selectedAttachments,
        previewImages,
        showNewSessionForm,
        showImageModal,
        modalImageUrl,
        newSessionName,

        // Loading states
        loading,
        uploading,
        error: sessionsError,

        // Actions
        setCurrentSession: handleSetCurrentSession,
        setSelectedModel: handleSetSelectedModel,
        setMessageInput: handleSetMessageInput,
        setSelectedImages: handleSetSelectedImages,
        setSelectedAttachments: handleSetSelectedAttachments,
        setShowNewSessionForm: handleSetShowNewSessionForm,
        setShowImageModal: handleSetShowImageModal,
        setModalImageUrl: handleSetModalImageUrl,
        setNewSessionName: handleSetNewSessionName,

        // API operations
        createSession,
        deleteSession,
        sendMessage,
        deleteMessage,
        editMessage,
        regenerateResponse,
        uploadImage,
    };
};
