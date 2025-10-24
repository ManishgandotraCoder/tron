import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { AISession, AIMessage } from '../api/aiApi';

interface AIState {
    currentSession: AISession | null;
    selectedModel: string;
    messageInput: string;
    selectedImages: File[];
    selectedAttachments: File[];
    previewImages: string[];
    showNewSessionForm: boolean;
    showImageModal: boolean;
    modalImageUrl: string;
    newSessionName: string;
}

const initialState: AIState = {
    currentSession: null,
    selectedModel: 'gpt-4',
    messageInput: '',
    selectedImages: [],
    selectedAttachments: [],
    previewImages: [],
    showNewSessionForm: false,
    showImageModal: false,
    modalImageUrl: '',
    newSessionName: '',
};

const aiSlice = createSlice({
    name: 'ai',
    initialState,
    reducers: {
        setCurrentSession: (state, action: PayloadAction<AISession | null>) => {
            state.currentSession = action.payload;
        },
        setSelectedModel: (state, action: PayloadAction<string>) => {
            state.selectedModel = action.payload;
        },
        setMessageInput: (state, action: PayloadAction<string>) => {
            state.messageInput = action.payload;
        },
        setSelectedImages: (state, action: PayloadAction<File[]>) => {
            state.selectedImages = action.payload;
        },
        setSelectedAttachments: (state, action: PayloadAction<File[]>) => {
            state.selectedAttachments = action.payload;
        },
        setPreviewImages: (state, action: PayloadAction<string[]>) => {
            state.previewImages = action.payload;
        },
        setShowNewSessionForm: (state, action: PayloadAction<boolean>) => {
            state.showNewSessionForm = action.payload;
        },
        setShowImageModal: (state, action: PayloadAction<boolean>) => {
            state.showImageModal = action.payload;
        },
        setModalImageUrl: (state, action: PayloadAction<string>) => {
            state.modalImageUrl = action.payload;
        },
        setNewSessionName: (state, action: PayloadAction<string>) => {
            state.newSessionName = action.payload;
        },
        clearMessageForm: (state) => {
            state.messageInput = '';
            state.selectedImages = [];
            state.selectedAttachments = [];
            state.previewImages = [];
        },
        clearNewSessionForm: (state) => {
            state.newSessionName = '';
            state.showNewSessionForm = false;
        },
        addMessageToCurrentSession: (state, action: PayloadAction<AIMessage>) => {
            if (state.currentSession) {
                state.currentSession.messages.push(action.payload);
                state.currentSession.updatedAt = new Date();
            }
        },
        updateMessageInCurrentSession: (state, action: PayloadAction<{ messageId: string; content: string }>) => {
            if (state.currentSession) {
                const messageIndex = state.currentSession.messages.findIndex(
                    msg => msg.id === action.payload.messageId
                );
                if (messageIndex !== -1) {
                    state.currentSession.messages[messageIndex].content = action.payload.content;
                    state.currentSession.updatedAt = new Date();
                }
            }
        },
        removeMessageFromCurrentSession: (state, action: PayloadAction<string>) => {
            if (state.currentSession) {
                state.currentSession.messages = state.currentSession.messages.filter(
                    msg => msg.id !== action.payload
                );
                state.currentSession.updatedAt = new Date();
            }
        },
    },
});

export const {
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
} = aiSlice.actions;

export default aiSlice.reducer;
