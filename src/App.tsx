import { useEffect } from 'react';
import { useAppDispatch } from './store/hooks';
import { fetchPlatformsAsync } from './store/slices/platformsSlice';
import { fetchDraftsAsync } from './store/slices/draftsSlice';
import { fetchPostsAsync } from './store/slices/postsSlice';
import { ComposerForm } from './components/ComposerForm';
import { PostStatsBar } from './components/PostStatsBar';
import { SearchAndFilterBar } from './components/SearchAndFilterBar';
import { DraftList } from './components/DraftList';
import { PublishedList } from './components/PublishedList';

/**
 * App Root Component connected to Redux Store
 * Initializes async thunks on mount and arranges memoized modular components.
 */
export default function App() {
  const dispatch = useAppDispatch();

  // Dispatch initial async thunks to populate normalized state
  useEffect(() => {
    dispatch(fetchPlatformsAsync());
    dispatch(fetchDraftsAsync());
    dispatch(fetchPostsAsync());
  }, [dispatch]);

  return (
    <main className="app-shell">
      <div className="app-frame">
        <div className="main-composer-column">
          <PostStatsBar />
          <ComposerForm />
        </div>
        <div className="sidebar-panels">
          <SearchAndFilterBar />
          <DraftList />
          <PublishedList />
        </div>
      </div>
    </main>
  );
}
