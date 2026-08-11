import React, { useEffect } from 'react';
import { useAppDispatch } from '../store/hooks';
import { fetchPlatformsAsync } from '../store/slices/platformsSlice';
import { fetchDraftsAsync } from '../store/slices/draftsSlice';
import { fetchPostsAsync } from '../store/slices/postsSlice';
import { ComposerForm } from '../components/ComposerForm';
import { PostStatsBar } from '../components/PostStatsBar';
import { SearchAndFilterBar } from '../components/SearchAndFilterBar';
import { DraftList } from '../components/DraftList';
import { PublishedList } from '../components/PublishedList';

export const ComposerPage: React.FC = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchPlatformsAsync());
    dispatch(fetchDraftsAsync());
    dispatch(fetchPostsAsync());
  }, [dispatch]);

  return (
    <div className="composer-page-frame">
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
  );
};
