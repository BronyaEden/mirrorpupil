import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
// import filesReducer from './filesSlice';
// import usersReducer from './usersSlice';
// import chatReducer from './chatSlice';
// import uiReducer from './uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    // files: filesReducer,
    // users: usersReducer,
    // chat: chatReducer,
    // ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;