import { configureStore } from '@reduxjs/toolkit';
import platformsReducer from './slices/platformsSlice';
import draftsReducer from './slices/draftsSlice';
import postsReducer from './slices/postsSlice';

export const store = configureStore({
  reducer: {
    platforms: platformsReducer,
    drafts: draftsReducer,
    posts: postsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
