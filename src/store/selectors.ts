import { createSelector } from '@reduxjs/toolkit';
import { RootState } from './index';
import { Platform, PublishedPost, Draft, ALL_PLATFORMS } from '../types';

/**
 * Experiment 2: Memoized Selectors using Reselect (createSelector)
 * All selectors compute derived state efficiently without duplicating data in Redux state.
 */

// Base Input Selectors
const selectPostsState = (state: RootState) => state.posts;
const selectDraftsState = (state: RootState) => state.drafts;
const selectPlatformsState = (state: RootState) => state.platforms;

// 1. Selector for All Published Posts
export const selectAllPosts = createSelector(
  [selectPostsState],
  (postsState): PublishedPost[] => {
    return postsState.ids.map((id) => postsState.entities[id]).filter(Boolean);
  }
);

// 2. Selector for Published Posts (explicit alias)
export const selectPublishedPosts = createSelector(
  [selectAllPosts],
  (publishedPosts): PublishedPost[] => publishedPosts
);

// 3. Selector for Draft Posts
export const selectDraftPosts = createSelector(
  [selectDraftsState],
  (draftsState): Draft[] => {
    return draftsState.ids.map((id) => draftsState.entities[id]).filter(Boolean);
  }
);

// 4. Selector for Posts By Platform (parameterized memoized selector)
export const selectPostsByPlatform = createSelector(
  [selectAllPosts, selectDraftPosts, (_state: RootState, platform: Platform) => platform],
  (publishedPosts, draftPosts, platform) => {
    const matchingPublished = publishedPosts.filter((p) => p.platforms?.includes(platform));
    const matchingDrafts = draftPosts.filter((d) => d.platforms?.includes(platform));
    return {
      published: matchingPublished,
      drafts: matchingDrafts,
      total: matchingPublished.length + matchingDrafts.length,
    };
  }
);

// 5. Selector for Total Published Posts Count
export const selectTotalPublishedPosts = createSelector(
  [selectAllPosts],
  (posts): number => posts.length
);

// 6. Selector for Total Drafts Count
export const selectTotalDrafts = createSelector(
  [selectDraftPosts],
  (drafts): number => drafts.length
);

// 7. Selector for Total Posts Count (Published + Drafts)
export const selectTotalPosts = createSelector(
  [selectTotalPublishedPosts, selectTotalDrafts],
  (totalPublished, totalDrafts): number => totalPublished + totalDrafts
);

// 8. Selector for Platform-wise Post Count
export const selectPlatformWisePostCount = createSelector(
  [selectAllPosts, selectDraftPosts],
  (publishedPosts, draftPosts): Record<Platform, number> => {
    const counts = ALL_PLATFORMS.reduce((acc, p) => {
      acc[p] = 0;
      return acc;
    }, {} as Record<Platform, number>);

    publishedPosts.forEach((post) => {
      post.platforms?.forEach((p) => {
        if (counts[p] !== undefined) counts[p]++;
      });
    });

    draftPosts.forEach((draft) => {
      draft.platforms?.forEach((p) => {
        if (counts[p] !== undefined) counts[p]++;
      });
    });

    return counts;
  }
);

// Input Selectors for Search & Filter Controls
export const selectSearchQuery = createSelector(
  [selectPostsState],
  (postsState): string => postsState.searchQuery
);

export const selectFilterPlatform = createSelector(
  [selectPostsState],
  (postsState): Platform | 'All' => postsState.selectedFilterPlatform
);

// 9. Selector for Searched Posts
export const selectSearchedPosts = createSelector(
  [selectAllPosts, selectSearchQuery],
  (posts, query): PublishedPost[] => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return posts;
    return posts.filter(
      (post) =>
        post.title.toLowerCase().includes(trimmed) ||
        post.content.toLowerCase().includes(trimmed)
    );
  }
);

// 10. Selector for Filtered Posts (combining platform filter & search query)
export const selectFilteredPosts = createSelector(
  [selectSearchedPosts, selectFilterPlatform],
  (searchedPosts, platformFilter): PublishedPost[] => {
    if (platformFilter === 'All') return searchedPosts;
    return searchedPosts.filter((post) => post.platforms?.includes(platformFilter));
  }
);

// Selector for currently editing draft object
export const selectEditingDraft = createSelector(
  [selectDraftsState],
  (draftsState): Draft | null => {
    if (!draftsState.editingDraftId) return null;
    return draftsState.entities[draftsState.editingDraftId] || null;
  }
);

// Selector for selected platform objects and limits
export const selectSelectedPlatforms = createSelector(
  [selectPlatformsState],
  (platformsState): Platform[] => platformsState.selectedPlatforms
);
