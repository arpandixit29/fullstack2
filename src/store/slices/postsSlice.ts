import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { PublishedPost, Platform } from '../../types';
import { mockApi } from '../../api/mockApi';

/**
 * Experiment 1: Normalized Posts Slice
 * Manages published posts in a normalized structure (ids + entities).
 * Also maintains search & filter state parameters for Experiment 2 memoized selectors.
 */
export interface PostsState {
  ids: string[];
  entities: Record<string, PublishedPost>;
  searchQuery: string;
  selectedFilterPlatform: Platform | 'All';
  busyId: string | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialPostsState: PostsState = {
  ids: [],
  entities: {},
  searchQuery: '',
  selectedFilterPlatform: 'All',
  busyId: null,
  status: 'idle',
  error: null,
};

// Async thunks for published post operations
export const fetchPostsAsync = createAsyncThunk('posts/fetchPosts', async () => {
  return await mockApi.fetchPosts();
});

export const publishPostAsync = createAsyncThunk(
  'posts/publishPost',
  async (payload: Omit<PublishedPost, 'id' | 'publishedAt'>) => {
    return await mockApi.publishPost(payload);
  }
);

export const deletePostAsync = createAsyncThunk(
  'posts/deletePost',
  async (postId: string) => {
    return await mockApi.deletePost(postId);
  }
);

export const postsSlice = createSlice({
  name: 'posts',
  initialState: initialPostsState,
  reducers: {
    // Search and Filter controls for Memoized Selectors (Experiment 2)
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    setFilterPlatform(state, action: PayloadAction<Platform | 'All'>) {
      state.selectedFilterPlatform = action.payload;
    },
    // Synchronous CRUD Reducers
    postAdded(state, action: PayloadAction<PublishedPost>) {
      const post = action.payload;
      if (!state.ids.includes(post.id)) {
        state.ids.push(post.id);
      }
      state.entities[post.id] = post;
    },
    postDeleted(state, action: PayloadAction<string>) {
      const id = action.payload;
      state.ids = state.ids.filter((postId) => postId !== id);
      delete state.entities[id];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Posts
      .addCase(fetchPostsAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchPostsAsync.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.ids = action.payload.map((p) => p.id);
        state.entities = action.payload.reduce((acc, post) => {
          acc[post.id] = post;
          return acc;
        }, {} as Record<string, PublishedPost>);
      })
      .addCase(fetchPostsAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch posts';
      })
      // Publish Post Async
      .addCase(publishPostAsync.pending, (state) => {
        state.busyId = 'saving';
      })
      .addCase(publishPostAsync.fulfilled, (state, action) => {
        state.busyId = null;
        const post = action.payload;
        if (!state.ids.includes(post.id)) {
          state.ids.push(post.id);
        }
        state.entities[post.id] = post;
      })
      .addCase(publishPostAsync.rejected, (state, action) => {
        state.busyId = null;
        state.error = action.error.message || 'Failed to publish post';
      })
      // Delete Post Async
      .addCase(deletePostAsync.pending, (state, action) => {
        state.busyId = action.meta.arg;
      })
      .addCase(deletePostAsync.fulfilled, (state, action) => {
        state.busyId = null;
        const id = action.payload;
        state.ids = state.ids.filter((postId) => postId !== id);
        delete state.entities[id];
      })
      .addCase(deletePostAsync.rejected, (state) => {
        state.busyId = null;
      });
  },
});

export const {
  setSearchQuery,
  setFilterPlatform,
  postAdded,
  postDeleted,
} = postsSlice.actions;

export default postsSlice.reducer;
