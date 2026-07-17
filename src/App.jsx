import { useState } from 'react';

const PLATFORM_LIMITS = {
  'Twitter/X': 280,
  LinkedIn: 3000,
  Instagram: 2200,
  Facebook: 63206,
};

const PLATFORM_OPTIONS = Object.keys(PLATFORM_LIMITS);

const createEmptyDraft = () => ({
  title: '',
  content: '',
  platform: 'Twitter/X',
});

const formatTimestamp = (value) => new Date(value).toLocaleString();

const createDraftId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return String(Date.now());
};

function ComposerForm({
  formData,
  onFieldChange,
  onSave,
  onPublish,
  isEditing,
  isSaving,
  characterCount,
  characterLimit,
  validationMessage,
}) {
  return (
    <section className="panel composer-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Post Composer</p>
          <h1>Multi-Platform Post Composer with Draft Management</h1>
        </div>
        <p className="panel-copy">
          Compose a post, check the platform limit in real time, and save it as a draft.
        </p>
      </div>

      <div className="form-grid">
        <label className="field">
          <span>Title</span>
          <input
            type="text"
            value={formData.title}
            onChange={(event) => onFieldChange('title', event.target.value)}
            placeholder="Enter a title"
          />
        </label>

        <label className="field">
          <span>Platform</span>
          <select
            value={formData.platform}
            onChange={(event) => onFieldChange('platform', event.target.value)}
          >
            {PLATFORM_OPTIONS.map((platform) => (
              <option key={platform} value={platform}>
                {platform}
              </option>
            ))}
          </select>
        </label>

        <label className="field field-full">
          <span>Content</span>
          <textarea
            value={formData.content}
            onChange={(event) => onFieldChange('content', event.target.value)}
            placeholder="Write your post content"
            rows="8"
          />
        </label>
      </div>

      <div className="composer-footer">
        <div className="validation-block">
          <p>
            Characters: {characterCount} / {characterLimit}
          </p>
          <p className={validationMessage ? 'validation-message warning' : 'validation-message'}>
            {validationMessage || 'Content is within the selected platform limit.'}
          </p>
        </div>

        <div className="action-row">
          <button type="button" className="primary-button" onClick={onSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : isEditing ? 'Update Draft' : 'Save Draft'}
          </button>
          <button type="button" className="publish-button" onClick={onPublish} disabled={isSaving}>
            {isSaving ? 'Publishing...' : 'Publish'}
          </button>
        </div>
      </div>
    </section>
  );
}

function DraftList({ drafts, onEdit, onDelete, isBusyId }) {
  return (
    <section className="panel drafts-panel">
      <div className="panel-header compact">
        <div>
          <p className="eyebrow">Drafts</p>
          <h2>Saved Drafts</h2>
        </div>
      </div>

      {drafts.length === 0 ? (
        <p className="empty-state">No drafts saved yet.</p>
      ) : (
        <div className="draft-list">
          {drafts.map((draft) => (
            <article key={draft.id} className="draft-card">
              <div className="draft-topline">
                <h3>{draft.title || 'Untitled Draft'}</h3>
                <span>{draft.platform}</span>
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
          ))}
        </div>
      )}
    </section>
  );
}

function PublishedList({ posts, onDelete, isBusyId }) {
  return (
    <section className="panel drafts-panel">
      <div className="panel-header compact">
        <div>
          <p className="eyebrow">Published</p>
          <h2>Published Posts</h2>
        </div>
      </div>

      {posts.length === 0 ? (
        <p className="empty-state">No published posts yet.</p>
      ) : (
        <div className="draft-list">
          {posts.map((post) => (
            <article key={post.id} className="draft-card">
              <div className="draft-topline">
                <h3>{post.title || 'Untitled Post'}</h3>
                <span>{post.platform}</span>
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
          ))}
        </div>
      )}
    </section>
  );
}

export default function App() {
  const [formData, setFormData] = useState(createEmptyDraft);
  const [drafts, setDrafts] = useState([]);
  const [publishedPosts, setPublishedPosts] = useState([]);
  const [editingDraftId, setEditingDraftId] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const characterCount = formData.content.length;
  const characterLimit = PLATFORM_LIMITS[formData.platform];
  const validationMessage =
    characterCount > characterLimit
      ? `${formData.platform} allows up to ${characterLimit} characters.`
      : '';

  const resetForm = () => {
    setFormData(createEmptyDraft());
    setEditingDraftId(null);
  };

  const updateField = (field, value) => {
    setFormData((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const saveDraft = () => {
    if (characterCount > characterLimit) {
      return;
    }

    setBusyId('saving');
    Promise.resolve().then(() => {
      setTimeout(() => {
        const savedAt = new Date().toISOString();

        setDrafts((currentDrafts) => {
          const updatedDraft = {
            id: editingDraftId || createDraftId(),
            title: formData.title,
            content: formData.content,
            platform: formData.platform,
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
    if (characterCount > characterLimit) {
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
            platform: formData.platform,
            publishedAt: new Date().toISOString(),
          },
        ]);
        resetForm();
        setBusyId(null);
      }, 400);
    });
  };

  const editDraft = (draft) => {
    setFormData({
      title: draft.title,
      content: draft.content,
      platform: draft.platform,
    });
    setEditingDraftId(draft.id);
  };

  const deleteDraft = (draftId) => {
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

  const deletePublishedPost = (postId) => {
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
          onSave={saveDraft}
          onPublish={publishPost}
          isEditing={editingDraftId !== null}
          isSaving={busyId === 'saving'}
          characterCount={characterCount}
          characterLimit={characterLimit}
          validationMessage={validationMessage}
        />
        <DraftList drafts={drafts} onEdit={editDraft} onDelete={deleteDraft} isBusyId={busyId} />
        <PublishedList posts={publishedPosts} onDelete={deletePublishedPost} isBusyId={busyId} />
      </div>
    </main>
  );
}