import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Draft, Platform } from '../../types';
import { mockApi } from '../../api/mockApi';

/**
 * Experiment 1: Normalized Drafts Slice
 * Manages post drafts in a normalized structure (ids + entities).
 * Includes CRUD operations and async thunks for persistence.
 */
export interface DraftsState {
  ids: string[];
  entities: Record<string, Draft>;
  editingDraftId: string | null;
  busyId: string | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialDraftsState: DraftsState = {
  ids: [],
  entities: {},
  editingDraftId: null,
  busyId: null,
  status: 'idle',
  error: null,
};

// Async thunks for draft operations
export const fetchDraftsAsync = createAsyncThunk('drafts/fetchDrafts', async () => {
  return await mockApi.fetchDrafts();
});

export const saveDraftAsync = createAsyncThunk(
  'drafts/saveDraft',
  async (payload: { id?: string; title: string; content: string; platforms: Platform[] }) => {
    return await mockApi.saveDraft(payload);
  }
);

export const deleteDraftAsync = createAsyncThunk(
  'drafts/deleteDraft',
  async (draftId: string) => {
    return await mockApi.deleteDraft(draftId);
  }
);

export const draftsSlice = createSlice({
  name: 'drafts',
  initialState: initialDraftsState,
  reducers: {
    // Set currently active draft for editing in the composer
    setEditingDraftId(state, action: PayloadAction<string | null>) {
      state.editingDraftId = action.payload;
    },
    clearEditingDraft(state) {
      state.editingDraftId = null;
    },
    // Synchronous CRUD Reducers for Drafts
    draftAdded(state, action: PayloadAction<Draft>) {
      const draft = action.payload;
      if (!state.ids.includes(draft.id)) {
        state.ids.push(draft.id);
      }
      state.entities[draft.id] = draft;
    },
    draftUpdated(state, action: PayloadAction<Draft>) {
      const draft = action.payload;
      state.entities[draft.id] = draft;
    },
    draftDeleted(state, action: PayloadAction<string>) {
      const id = action.payload;
      state.ids = state.ids.filter((draftId) => draftId !== id);
      delete state.entities[id];
      if (state.editingDraftId === id) {
        state.editingDraftId = null;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Drafts
      .addCase(fetchDraftsAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchDraftsAsync.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.ids = action.payload.map((d) => d.id);
        state.entities = action.payload.reduce((acc, draft) => {
          acc[draft.id] = draft;
          return acc;
        }, {} as Record<string, Draft>);
      })
      .addCase(fetchDraftsAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch drafts';
      })
      // Save Draft Async
      .addCase(saveDraftAsync.pending, (state) => {
        state.busyId = 'saving';
      })
      .addCase(saveDraftAsync.fulfilled, (state, action) => {
        state.busyId = null;
        const draft = action.payload;
        if (!state.ids.includes(draft.id)) {
          state.ids.push(draft.id);
        }
        state.entities[draft.id] = draft;
        state.editingDraftId = null;
      })
      .addCase(saveDraftAsync.rejected, (state, action) => {
        state.busyId = null;
        state.error = action.error.message || 'Failed to save draft';
      })
      // Delete Draft Async
      .addCase(deleteDraftAsync.pending, (state, action) => {
        state.busyId = action.meta.arg;
      })
      .addCase(deleteDraftAsync.fulfilled, (state, action) => {
        state.busyId = null;
        const id = action.payload;
        state.ids = state.ids.filter((draftId) => draftId !== id);
        delete state.entities[id];
        if (state.editingDraftId === id) {
          state.editingDraftId = null;
        }
      })
      .addCase(deleteDraftAsync.rejected, (state) => {
        state.busyId = null;
      });
  },
});

export const {
  setEditingDraftId,
  clearEditingDraft,
  draftAdded,
  draftUpdated,
  draftDeleted,
} = draftsSlice.actions;

export default draftsSlice.reducer;
