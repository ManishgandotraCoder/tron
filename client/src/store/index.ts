import { configureStore } from '@reduxjs/toolkit';
import { authApi } from './api/authApi';
import { userApi } from './api/userApi';
import { aiApi } from './api/aiApi';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import aiReducer from './slices/aiSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        user: userReducer,
        ai: aiReducer,
        [authApi.reducerPath]: authApi.reducer,
        [userApi.reducerPath]: userApi.reducer,
        [aiApi.reducerPath]: aiApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
            },
        })
            .concat(authApi.middleware)
            .concat(userApi.middleware)
            .concat(aiApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;