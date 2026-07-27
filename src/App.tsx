import { useState } from 'react';

export type Platform = 'Twitter/X' | 'LinkedIn' | 'Instagram' | 'Facebook' | 'Threads';

export interface PlatformInfo {
  name: Platform;
  limit: number;
  color: string;
  bgColor: string;
}

export const PLATFORM_DETAILS: Record<Platform, PlatformInfo> = {
  'Twitter/X': {
    name: 'Twitter/X',
    limit: 280,
    color: '#0f1419',
    bgColor: '#e7e7e8',
  },
  LinkedIn: {
    name: 'LinkedIn',
    limit: 3000,
    color: '#0a66c2',
    bgColor: '#e0f2fe',
  },
  Instagram: {
    name: 'Instagram',
    limit: 2200,
    color: '#d62976',
    bgColor: '#fce7f3',
  },
  Facebook: {
    name: 'Facebook',
    limit: 63206,
    color: '#1877f2',
    bgColor: '#dbeafe',
  },
  Threads: {
    name: 'Threads',
    limit: 500,
    color: '#101010',
    bgColor: '#f3f4f6',
  },
};

export const ALL_PLATFORMS = Object.keys(PLATFORM_DETAILS) as Platform[];

export interface DraftFormData {
  title: string;
  content: string;
  platforms: Platform[];
}

export interface Draft {
  id: string;
  title: string;
  content: string;
  platforms: Platform[];
  savedAt: string;
}

export interface PublishedPost {
  id: string;
  title: string;
  content: string;
  platforms: Platform[];
  publishedAt: string;
}

const createEmptyDraft = (): DraftFormData => ({
  title: '',
  content: '',
  platforms: ['Twitter/X', 'LinkedIn'],
});

const formatTimestamp = (value: string): string => new Date(value).toLocaleString();

const createDraftId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return String(Date.now());
};

interface ComposerFormProps {
  formData: DraftFormData;
  onFieldChange: <K extends keyof DraftFormData>(field: K, value: DraftFormData[K]) => void;
  onTogglePlatform: (platform: Platform) => void;
  onSelectAllPlatforms: () => void;
  onClearPlatforms: () => void;
  onSave: () => void;
  onPublish: () => void;
  isEditing: boolean;
  isSaving: boolean;
  characterCount: number;
  strictestLimit: number | null;
  exceededPlatforms: Platform[];
}

function ComposerForm({
  formData,
  onFieldChange,
  onTogglePlatform,
  onSelectAllPlatforms,
  onClearPlatforms,
  onSave,
  onPublish,
  isEditing,
  isSaving,
  characterCount,
  strictestLimit,
  exceededPlatforms,
}: ComposerFormProps) {
  const selectedCount = formData.platforms.length;
  const isFormValid = selectedCount > 0 && exceededPlatforms.length === 0;

  return (
    <section className="panel composer-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Post Composer (TypeScript)</p>
          <h1>Multi-Platform Post Composer</h1>
        </div>
        <p className="panel-copy">
          Select multiple platforms, check character limits in real time across all selected channels, and save or publish seamlessly.
        </p>
      </div>

      <div className="form-grid">
        <label className="field field-full">
          <span>Post Title</span>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => onFieldChange('title', e.target.value)}
            placeholder="Enter a title for your post..."
          />
        </label>

        <div className="field field-full">
          <div className="platform-header-row">
            <span>Target Platforms (Select Multiple)</span>
            <div className="platform-quick-actions">
              <button
                type="button"
                className="text-link-btn"
                onClick={onSelectAllPlatforms}
              >
                Select All
              </button>
              <span className="divider">•</span>
              <button
                type="button"
                className="text-link-btn"
                onClick={onClearPlatforms}
              >
                Clear All
              </button>
            </div>
          </div>

          <div className="platform-chips-container">
            {ALL_PLATFORMS.map((platform) => {
              const isSelected = formData.platforms.includes(platform);
              const info = PLATFORM_DETAILS[platform];
              const isExceeded = isSelected && characterCount > info.limit;

              return (
                <button
                  key={platform}
                  type="button"
                  className={`platform-chip ${isSelected ? 'selected' : ''} ${
                    isExceeded ? 'exceeded' : ''
                  }`}
                  onClick={() => onTogglePlatform(platform)}
                >
                  <span
                    className="chip-indicator"
                    style={{
                      backgroundColor: isSelected ? info.color : 'transparent',
                    }}
                  />
                  <span className="chip-name">{platform}</span>
                  <span className="chip-limit">({info.limit.toLocaleString()} chars)</span>
                  {isSelected && <span className="chip-checkmark">✓</span>}
                </button>
              );
            })}
          </div>

          {selectedCount === 0 && (
            <p className="validation-message warning margin-top-sm">
              ⚠️ Please select at least one platform to publish or save your draft.
            </p>
          )}
        </div>

        <label className="field field-full">
          <span>Post Content</span>
          <textarea
            value={formData.content}
            onChange={(e) => onFieldChange('content', e.target.value)}
            placeholder="Write your content here..."
            rows={8}
          />
        </label>
      </div>

      <div className="composer-footer">
        <div className="validation-block">
          {selectedCount > 0 ? (
            <>
              <p className="char-count-text">
                Characters: <strong>{characterCount}</strong>
                {strictestLimit !== null && (
                  <span> / Strictest Limit: <strong>{strictestLimit.toLocaleString()}</strong></span>
                )}
              </p>

              {exceededPlatforms.length > 0 ? (
                <div className="validation-message warning">
                  ⚠️ Content exceeds limit for:{' '}
                  {exceededPlatforms
                    .map(
                      (p) => `${p} (${characterCount - PLATFORM_DETAILS[p].limit} over limit)`
                    )
                    .join(', ')}
                </div>
              ) : (
                <div className="validation-message success">
                  ✓ Content fits within all {selectedCount} selected platform limits.
                </div>
              )}
            </>
          ) : (
            <p className="validation-message">Select platforms above to view character limits.</p>
          )}
        </div>

        <div className="action-row">
          <button
            type="button"
            className="primary-button"
            onClick={onSave}
            disabled={isSaving || !isFormValid}
          >
            {isSaving ? 'Saving...' : isEditing ? 'Update Draft' : 'Save Draft'}
          </button>
          <button
            type="button"
            className="publish-button"
            onClick={onPublish}
            disabled={isSaving || !isFormValid}
          >
            {isSaving ? 'Publishing...' : 'Publish Post'}
          </button>
        </div>
      </div>
    </section>
  );
}

interface DraftListProps {
  drafts: Draft[];
  onEdit: (draft: Draft) => void;
  onDelete: (id: string) => void;
  isBusyId: string | null;
}

function DraftList({ drafts, onEdit, onDelete, isBusyId }: DraftListProps) {
  return (
    <section className="panel drafts-panel">
      <div className="panel-header compact">
        <div>
          <p className="eyebrow">Drafts</p>
          <h2>Saved Drafts ({drafts.length})</h2>
        </div>
      </div>

      {drafts.length === 0 ? (
        <p className="empty-state">No drafts saved yet.</p>
      ) : (
        <div className="draft-list">
          {drafts.map((draft) => {
            const platforms = draft.platforms || [];
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
                <p className="draft-meta">Saved at: {formatTimestamp(draft.savedAt)}</p>
                <p className="draft-content">{draft.content}</p>
                <div className="draft-actions">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => onEdit(draft)}
                    disabled={isBusyId === draft.id}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="danger-button"
                    onClick={() => onDelete(draft.id)}
                    disabled={isBusyId === draft.id}
                  >
                    {isBusyId === draft.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

interface PublishedListProps {
  posts: PublishedPost[];
  onDelete: (id: string) => void;
  isBusyId: string | null;
}

function PublishedList({ posts, onDelete, isBusyId }: PublishedListProps) {
  return (
    <section className="panel drafts-panel margin-top-md">
      <div className="panel-header compact">
        <div>
          <p className="eyebrow">Published</p>
          <h2>Published Posts ({posts.length})</h2>
        </div>
      </div>

      {posts.length === 0 ? (
        <p className="empty-state">No published posts yet.</p>
      ) : (
        <div className="draft-list">
          {posts.map((post) => {
            const platforms = post.platforms || [];
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
                <p className="draft-meta">Published at: {formatTimestamp(post.publishedAt)}</p>
                <p className="draft-content">{post.content}</p>
                <div className="draft-actions">
                  <button
                    type="button"
                    className="danger-button"
                    onClick={() => onDelete(post.id)}
                    disabled={isBusyId === post.id}
                  >
                    {isBusyId === post.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default function App() {
  const [formData, setFormData] = useState<DraftFormData>(createEmptyDraft);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [publishedPosts, setPublishedPosts] = useState<PublishedPost[]>([]);
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const characterCount = formData.content.length;

  const selectedLimits = formData.platforms.map((p) => PLATFORM_DETAILS[p].limit);
  const strictestLimit = selectedLimits.length > 0 ? Math.min(...selectedLimits) : null;

  const exceededPlatforms = formData.platforms.filter(
    (p) => characterCount > PLATFORM_DETAILS[p].limit
  );

  const resetForm = () => {
    setFormData(createEmptyDraft());
    setEditingDraftId(null);
  };

  const updateField = <K extends keyof DraftFormData>(field: K, value: DraftFormData[K]) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const togglePlatform = (platform: Platform) => {
    setFormData((prev) => {
      const exists = prev.platforms.includes(platform);
      const newPlatforms = exists
        ? prev.platforms.filter((p) => p !== platform)
        : [...prev.platforms, platform];
      return {
        ...prev,
        platforms: newPlatforms,
      };
    });
  };

  const selectAllPlatforms = () => {
    setFormData((prev) => ({
      ...prev,
      platforms: [...ALL_PLATFORMS],
    }));
  };

  const clearPlatforms = () => {
    setFormData((prev) => ({
      ...prev,
      platforms: [],
    }));
  };

  const saveDraft = () => {
    if (formData.platforms.length === 0 || exceededPlatforms.length > 0) {
      return;
    }

    setBusyId('saving');
    Promise.resolve().then(() => {
      setTimeout(() => {
        const savedAt = new Date().toISOString();

        setDrafts((currentDrafts) => {
          const updatedDraft: Draft = {
            id: editingDraftId || createDraftId(),
            title: formData.title,
            content: formData.content,
            platforms: [...formData.platforms],
            savedAt,
          };

          const filteredDrafts = currentDrafts.filter((draft) => draft.id !== editingDraftId);
          return [...filteredDrafts, updatedDraft];
        });
        resetForm();
        setBusyId(null);
      }, 400);
    });
  };

  const publishPost = () => {
    if (formData.platforms.length === 0 || exceededPlatforms.length > 0) {
      return;
    }

    setBusyId('saving');
    Promise.resolve().then(() => {
      setTimeout(() => {
        setPublishedPosts((currentPosts) => [
          ...currentPosts,
          {
            id: createDraftId(),
            title: formData.title,
            content: formData.content,
            platforms: [...formData.platforms],
            publishedAt: new Date().toISOString(),
          },
        ]);
        resetForm();
        setBusyId(null);
      }, 400);
    });
  };

  const editDraft = (draft: Draft) => {
    const rawPlatforms = draft.platforms as unknown;
    let platformsToSet: Platform[] = [];

    if (Array.isArray(rawPlatforms)) {
      platformsToSet = rawPlatforms as Platform[];
    } else if (typeof rawPlatforms === 'string') {
      platformsToSet = [rawPlatforms as Platform];
    } else {
      platformsToSet = ['Twitter/X'];
    }

    setFormData({
      title: draft.title,
      content: draft.content,
      platforms: platformsToSet,
    });
    setEditingDraftId(draft.id);
  };

  const deleteDraft = (draftId: string) => {
    setBusyId(draftId);
    Promise.resolve().then(() => {
      setTimeout(() => {
        setDrafts((currentDrafts) => currentDrafts.filter((draft) => draft.id !== draftId));
        if (editingDraftId === draftId) {
          resetForm();
        }
        setBusyId(null);
      }, 400);
    });
  };

  const deletePublishedPost = (postId: string) => {
    setBusyId(postId);
    Promise.resolve().then(() => {
      setTimeout(() => {
        setPublishedPosts((currentPosts) => currentPosts.filter((post) => post.id !== postId));
        setBusyId(null);
      }, 400);
    });
  };

  return (
    <main className="app-shell">
      <div className="app-frame">
        <ComposerForm
          formData={formData}
          onFieldChange={updateField}
          onTogglePlatform={togglePlatform}
          onSelectAllPlatforms={selectAllPlatforms}
          onClearPlatforms={clearPlatforms}
          onSave={saveDraft}
          onPublish={publishPost}
          isEditing={editingDraftId !== null}
          isSaving={busyId === 'saving'}
          characterCount={characterCount}
          strictestLimit={strictestLimit}
          exceededPlatforms={exceededPlatforms}
        />
        <div className="sidebar-panels">
          <DraftList drafts={drafts} onEdit={editDraft} onDelete={deleteDraft} isBusyId={busyId} />
          <PublishedList posts={publishedPosts} onDelete={deletePublishedPost} isBusyId={busyId} />
        </div>
      </div>
    </main>
  );
}
