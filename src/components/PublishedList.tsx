import React, { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { selectFilteredPosts } from '../store/selectors';
import { deletePostAsync } from '../store/slices/postsSlice';
import { PLATFORM_DETAILS } from '../types';

/**
 * Experiment 1 & 2 Component: PublishedList
 * Subscribes to memoized selectFilteredPosts (combines search + platform filtering).
 * Re-renders only when filtered results or busy states change.
 */
export const PublishedList: React.FC = React.memo(() => {
  const dispatch = useAppDispatch();
  const posts = useAppSelector(selectFilteredPosts);
  const busyId = useAppSelector((state) => state.posts.busyId);

  const handleDelete = useCallback(
    (id: string) => {
      dispatch(deletePostAsync(id));
    },
    [dispatch]
  );

  return (
    <section className="panel drafts-panel margin-top-md">
      <div className="panel-header compact">
        <div>
          <p className="eyebrow">Redux Published</p>
          <h2>Published Posts ({posts.length})</h2>
        </div>
      </div>

      {posts.length === 0 ? (
        <p className="empty-state">No matching published posts found.</p>
      ) : (
        <div className="draft-list">
          {posts.map((post) => {
            const platforms = post.platforms || [];
            const isDeleting = busyId === post.id;

            return (
              <article key={post.id} className="draft-card published-card">
                <div className="draft-topline">
                  <h3>{post.title || 'Untitled Post'}</h3>
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
                  Published at: {new Date(post.publishedAt).toLocaleString()}
                </p>
                <p className="draft-content">{post.content}</p>
                <div className="draft-actions">
                  <button
                    type="button"
                    className="danger-button"
                    onClick={() => handleDelete(post.id)}
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

PublishedList.displayName = 'PublishedList';
