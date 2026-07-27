import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  togglePlatform,
  selectAllPlatforms,
  clearPlatforms,
} from '../store/slices/platformsSlice';
import { saveDraftAsync, clearEditingDraft } from '../store/slices/draftsSlice';
import { publishPostAsync } from '../store/slices/postsSlice';
import { selectSelectedPlatforms, selectEditingDraft } from '../store/selectors';
import { ALL_PLATFORMS, PLATFORM_DETAILS, Platform } from '../types';

/**
 * Experiment 1 & 2 Component: ComposerForm
 * Connected directly to Redux store using useAppSelector and useAppDispatch.
 * Eliminates prop-drilling. Uses React.memo, useCallback, and useMemo for performance.
 */
export const ComposerForm: React.FC = React.memo(() => {
  const dispatch = useAppDispatch();
  const selectedPlatforms = useAppSelector(selectSelectedPlatforms);
  const editingDraft = useAppSelector(selectEditingDraft);
  const isDraftSaving = useAppSelector((state) => state.drafts.busyId === 'saving');
  const isPostPublishing = useAppSelector((state) => state.posts.busyId === 'saving');
  const isSaving = isDraftSaving || isPostPublishing;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  // Sync form when editing a draft selected in Redux
  useEffect(() => {
    if (editingDraft) {
      setTitle(editingDraft.title);
      setContent(editingDraft.content);
    }
  }, [editingDraft]);

  const characterCount = content.length;

  // Compute strictest limit & exceeded platforms using useMemo
  const { strictestLimit, exceededPlatforms } = useMemo(() => {
    const limits = selectedPlatforms.map((p) => PLATFORM_DETAILS[p].limit);
    const limit = limits.length > 0 ? Math.min(...limits) : null;
    const exceeded = selectedPlatforms.filter(
      (p) => characterCount > PLATFORM_DETAILS[p].limit
    );
    return { strictestLimit: limit, exceededPlatforms: exceeded };
  }, [selectedPlatforms, characterCount]);

  const isFormValid = selectedPlatforms.length > 0 && exceededPlatforms.length === 0;

  const handleTogglePlatform = useCallback(
    (platform: Platform) => {
      dispatch(togglePlatform(platform));
    },
    [dispatch]
  );

  const handleSelectAll = useCallback(() => {
    dispatch(selectAllPlatforms());
  }, [dispatch]);

  const handleClearAll = useCallback(() => {
    dispatch(clearPlatforms());
  }, [dispatch]);

  const handleReset = useCallback(() => {
    setTitle('');
    setContent('');
    dispatch(clearEditingDraft());
  }, [dispatch]);

  const handleSaveDraft = useCallback(() => {
    if (!isFormValid || isSaving) return;
    dispatch(
      saveDraftAsync({
        id: editingDraft?.id,
        title,
        content,
        platforms: selectedPlatforms,
      })
    ).then(() => {
      handleReset();
    });
  }, [isFormValid, isSaving, dispatch, editingDraft, title, content, selectedPlatforms, handleReset]);

  const handlePublishPost = useCallback(() => {
    if (!isFormValid || isSaving) return;
    dispatch(
      publishPostAsync({
        title,
        content,
        platforms: selectedPlatforms,
      })
    ).then(() => {
      handleReset();
    });
  }, [isFormValid, isSaving, dispatch, title, content, selectedPlatforms, handleReset]);

  return (
    <section className="panel composer-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Redux Toolkit Post Composer</p>
          <h1>Multi-Platform Post Composer</h1>
        </div>
        <p className="panel-copy">
          Select multiple target platforms, write content with real-time limit checks, and store state cleanly with Redux Toolkit.
        </p>
      </div>

      <div className="form-grid">
        <label className="field field-full">
          <span>Post Title</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter post title..."
          />
        </label>

        <div className="field field-full">
          <div className="platform-header-row">
            <span>
              Select Target Platforms ({selectedPlatforms.length} of {ALL_PLATFORMS.length} selected)
            </span>
            <div className="platform-quick-actions">
              <button type="button" className="text-link-btn" onClick={handleSelectAll}>
                Select All
              </button>
              <span className="divider">•</span>
              <button type="button" className="text-link-btn" onClick={handleClearAll}>
                Clear All
              </button>
            </div>
          </div>

          <div className="platform-selection-grid">
            {ALL_PLATFORMS.map((platform) => {
              const isSelected = selectedPlatforms.includes(platform);
              const info = PLATFORM_DETAILS[platform];
              const isExceeded = isSelected && characterCount > info.limit;

              return (
                <label
                  key={platform}
                  className={`platform-checkbox-card ${isSelected ? 'selected' : ''} ${
                    isExceeded ? 'exceeded' : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    className="platform-checkbox-input"
                    checked={isSelected}
                    onChange={() => handleTogglePlatform(platform)}
                  />
                  <div className="platform-card-content">
                    <div className="platform-card-top">
                      <span
                        className="platform-color-dot"
                        style={{ backgroundColor: info.color }}
                      />
                      <span className="platform-card-title">{platform}</span>
                    </div>
                    <div className="platform-card-limit">
                      Limit: <strong>{info.limit.toLocaleString()}</strong> chars
                    </div>
                  </div>
                </label>
              );
            })}
          </div>

          {selectedPlatforms.length === 0 && (
            <p className="validation-message warning margin-top-sm">
              ⚠️ Please select at least one target platform.
            </p>
          )}
        </div>

        <label className="field field-full">
          <span>Post Content</span>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your content here..."
            rows={8}
          />
        </label>
      </div>

      <div className="composer-footer">
        <div className="validation-block">
          {selectedPlatforms.length > 0 ? (
            <>
              <p className="char-count-text">
                Current Length: <strong>{characterCount}</strong> chars
                {strictestLimit !== null && (
                  <span> (Strictest selected limit: <strong>{strictestLimit.toLocaleString()}</strong>)</span>
                )}
              </p>

              {exceededPlatforms.length > 0 ? (
                <div className="validation-message warning">
                  ⚠️ Exceeds limit for:{' '}
                  {exceededPlatforms
                    .map(
                      (p) => `${p} (${characterCount - PLATFORM_DETAILS[p].limit} over)`
                    )
                    .join(', ')}
                </div>
              ) : (
                <div className="validation-message success">
                  ✓ Content fits within all {selectedPlatforms.length} selected platform limits.
                </div>
              )}
            </>
          ) : (
            <p className="validation-message">Select platforms above to view limits.</p>
          )}
        </div>

        <div className="action-row">
          <button
            type="button"
            className="primary-button"
            onClick={handleSaveDraft}
            disabled={isSaving || !isFormValid}
          >
            {isSaving ? 'Saving...' : editingDraft ? 'Update Draft' : 'Save Draft'}
          </button>
          <button
            type="button"
            className="publish-button"
            onClick={handlePublishPost}
            disabled={isSaving || !isFormValid}
          >
            {isSaving ? 'Publishing...' : 'Publish Post'}
          </button>
        </div>
      </div>
    </section>
  );
});

ComposerForm.displayName = 'ComposerForm';
