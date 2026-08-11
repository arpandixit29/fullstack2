import React from 'react';
import { useAppSelector } from '../store/hooks';
import {
  selectTotalPosts,
  selectTotalPublishedPosts,
  selectTotalDrafts,
  selectPlatformWisePostCount,
} from '../store/selectors';
import { ALL_PLATFORMS } from '../types';

/**
 * Experiment 2 Component: PostStatsBar
 * Displays memoized statistics computed via Reselect createSelector.
 * Wrapped in React.memo to prevent unnecessary re-renders.
 */
export const PostStatsBar: React.FC = React.memo(() => {
  const totalPosts = useAppSelector(selectTotalPosts);
  const totalPublished = useAppSelector(selectTotalPublishedPosts);
  const totalDrafts = useAppSelector(selectTotalDrafts);
  const platformCounts = useAppSelector(selectPlatformWisePostCount);

  return (
    <div className="stats-bar-panel">
      <div className="stats-header">
        <h3>📊 Real-time Post Statistics (Memoized Selectors)</h3>
      </div>
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-value">{totalPosts}</span>
          <span className="stat-label">Total Items</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{totalPublished}</span>
          <span className="stat-label">Published</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{totalDrafts}</span>
          <span className="stat-label">Drafts</span>
        </div>
      </div>
      <div className="platform-stats-row">
        {ALL_PLATFORMS.map((platform) => (
          <div key={platform} className="platform-stat-pill">
            <span className="platform-stat-name">{platform}:</span>
            <span className="platform-stat-count">{platformCounts[platform] || 0}</span>
          </div>
        ))}
      </div>
    </div>
  );
});

PostStatsBar.displayName = 'PostStatsBar';
