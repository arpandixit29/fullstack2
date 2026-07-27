import React, { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { selectSearchQuery, selectFilterPlatform } from '../store/selectors';
import { setSearchQuery, setFilterPlatform } from '../store/slices/postsSlice';
import { ALL_PLATFORMS, Platform } from '../types';

/**
 * Experiment 2 Component: SearchAndFilterBar
 * Allows searching and filtering published posts.
 * Dispatches actions to Redux, triggering memoized selectFilteredPosts computation.
 * Wrapped in React.memo and uses useCallback for event handlers.
 */
export const SearchAndFilterBar: React.FC = React.memo(() => {
  const dispatch = useAppDispatch();
  const searchQuery = useAppSelector(selectSearchQuery);
  const filterPlatform = useAppSelector(selectFilterPlatform);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      dispatch(setSearchQuery(e.target.value));
    },
    [dispatch]
  );

  const handleFilterChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      dispatch(setFilterPlatform(e.target.value as Platform | 'All'));
    },
    [dispatch]
  );

  return (
    <div className="search-filter-panel">
      <div className="search-field">
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="🔍 Search published posts by title or content..."
        />
      </div>
      <div className="filter-field">
        <select value={filterPlatform} onChange={handleFilterChange}>
          <option value="All">All Target Platforms</option>
          {ALL_PLATFORMS.map((p) => (
            <option key={p} value={p}>
              Filter by {p}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
});

SearchAndFilterBar.displayName = 'SearchAndFilterBar';
