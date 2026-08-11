import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Platform, PlatformInfo, PLATFORM_DETAILS, ALL_PLATFORMS } from '../../types';
import { mockApi } from '../../api/mockApi';

/**
 * Experiment 1: Normalized Platforms Slice
 * Stores platform metadata in a normalized structure (ids + entities)
 * and manages user's active multi-platform selection.
 */
export interface PlatformsState {
  ids: Platform[];
  entities: Record<Platform, PlatformInfo>;
  selectedPlatforms: Platform[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialPlatformsState: PlatformsState = {
  ids: ALL_PLATFORMS,
  entities: PLATFORM_DETAILS,
  selectedPlatforms: ['Twitter/X', 'LinkedIn'],
  status: 'idle',
  error: null,
};

// Async thunk for loading platforms asynchronously
export const fetchPlatformsAsync = createAsyncThunk(
  'platforms/fetchPlatforms',
  async () => {
    const data = await mockApi.fetchPlatforms();
    return data;
  }
);

export const platformsSlice = createSlice({
  name: 'platforms',
  initialState: initialPlatformsState,
  reducers: {
    // Toggle a platform in or out of selectedPlatforms array
    togglePlatform(state, action: PayloadAction<Platform>) {
      const platform = action.payload;
      const exists = state.selectedPlatforms.includes(platform);
      if (exists) {
        state.selectedPlatforms = state.selectedPlatforms.filter((p) => p !== platform);
      } else {
        state.selectedPlatforms.push(platform);
      }
    },
    // Select all available platforms
    selectAllPlatforms(state) {
      state.selectedPlatforms = [...state.ids];
    },
    // Deselect all platforms
    clearPlatforms(state) {
      state.selectedPlatforms = [];
    },
    // Explicitly set selected platforms
    setSelectedPlatforms(state, action: PayloadAction<Platform[]>) {
      state.selectedPlatforms = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlatformsAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchPlatformsAsync.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.entities = action.payload;
        state.ids = Object.keys(action.payload) as Platform[];
      })
      .addCase(fetchPlatformsAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch platforms';
      });
  },
});

export const {
  togglePlatform,
  selectAllPlatforms,
  clearPlatforms,
  setSelectedPlatforms,
} = platformsSlice.actions;

export default platformsSlice.reducer;
