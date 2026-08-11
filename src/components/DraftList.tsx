import React, { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { selectDraftPosts } from '../store/selectors';
import { setEditingDraftId, deleteDraftAsync } from '../store/slices/draftsSlice';
import { setSelectedPlatforms } from '../store/slices/platformsSlice';
import { Draft, PLATFORM_DETAILS } from '../types';

/**
 * Experiment 1 & 2 Component: DraftList
 * Subscribes to draft state via selectDraftPosts memoized selector.
 * Dispatches async thunks and actions directly to Redux.
 */
export const DraftList: React.FC = React.memo(() => {
  const dispatch = useAppDispatch();
  const drafts = useAppSelector(selectDraftPosts);
  const busyId = useAppSelector((state) => state.drafts.busyId);

  const handleEdit = useCallback(
    (draft: Draft) => {
      dispatch(setEditingDraftId(draft.id));
      if (draft.platforms && draft.platforms.length > 0) {
        dispatch(setSelectedPlatforms(draft.platforms));
      }
    },
    [dispatch]
  );

  const handleDelete = useCallback(
    (id: string) => {
      dispatch(deleteDraftAsync(id));
    },
    [dispatch]
  );

  return (
    <section className="panel drafts-panel">
      <div className="panel-header compact">
        <div>
          <p className="eyebrow">Redux Drafts</p>
          <h2>Saved Drafts ({drafts.length})</h2>
        </div>
      </div>

      {drafts.length === 0 ? (
        <p className="empty-state">No drafts saved in Redux yet.</p>
      ) : (
        <div className="draft-list">
          {drafts.map((draft) => {
            const platforms = draft.platforms || [];
            const isDeleting = busyId === draft.id;

            return (
              <article key={draft.id} className="draft-card">
                <div className="draft-topline">
                  <h3>{draft.title || 'Untitled Draft'}</h3>
                  <div className="platform-badges">
                    {platforms.map((p) => {
                      const info = PLATFORM_DETAILS[p];
                      return (
                        <span
                          key={p}
                          className="platform-badge"
                          style={{
                            color: info?.color || '#333',
                            backgroundColor: info?.bgColor || '#eee',
                          }}
                        >
                          {p}
                        </span>
                      );
                    })}
                  </div>
                </div>
                <p className="draft-meta">
                  Saved at: {new Date(draft.savedAt).toLocaleString()}
                </p>
                <p className="draft-content">{draft.content}</p>
                <div className="draft-actions">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => handleEdit(draft)}
                    disabled={isDeleting}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="danger-button"
                    onClick={() => handleDelete(draft.id)}
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
});

DraftList.displayName = 'DraftList';
