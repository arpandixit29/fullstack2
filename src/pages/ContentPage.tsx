import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { INITIAL_CONTENT_ITEMS, addAuditLog } from '../api/authApi';
import { ContentItem } from '../types';
import { Plus, Edit3, Trash2, Search, Filter, Lock, Eye, Sparkles, X } from 'lucide-react';

export const ContentPage: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const [contents, setContents] = useState<ContentItem[]>(INITIAL_CONTENT_ITEMS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('Security Architecture');
  const [formSummary, setFormSummary] = useState('');
  const [formBody, setFormBody] = useState('');
  const [formStatus, setFormStatus] = useState<'published' | 'draft'>('draft');

  const canCreate = hasPermission('create:content');
  const canEdit = hasPermission('edit:content');
  const canDelete = hasPermission('delete:content');
  const canPublish = hasPermission('publish:content');

  const openCreateModal = () => {
    setEditingItem(null);
    setFormTitle('');
    setFormCategory('Security Architecture');
    setFormSummary('');
    setFormBody('');
    setFormStatus('draft');
    setIsModalOpen(true);
  };

  const openEditModal = (item: ContentItem) => {
    setEditingItem(item);
    setFormTitle(item.title);
    setFormCategory(item.category);
    setFormSummary(item.summary);
    setFormBody(item.content);
    setFormStatus(item.status === 'published' ? 'published' : 'draft');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formSummary) return;

    if (editingItem) {
      // Edit mode
      const updated = contents.map((c) =>
        c.id === editingItem.id
          ? {
              ...c,
              title: formTitle,
              category: formCategory,
              summary: formSummary,
              content: formBody,
              status: formStatus,
              updatedAt: new Date().toISOString(),
            }
          : c
      );
      setContents(updated);

      if (user) {
        addAuditLog({
          userId: user.id,
          userName: user.name,
          userRole: user.role,
          action: 'CONTENT_UPDATE',
          target: editingItem.id,
          status: 'success',
          details: `Updated content item "${formTitle}" (Status: ${formStatus})`,
          ipAddress: '127.0.0.1 (Localhost)',
        });
      }
    } else {
      // Create mode
      const newItem: ContentItem = {
        id: `cnt_${Date.now()}`,
        title: formTitle,
        category: formCategory,
        summary: formSummary,
        content: formBody,
        author: user?.name || 'Anonymous',
        authorRole: user?.role || 'editor',
        status: formStatus,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setContents([newItem, ...contents]);

      if (user) {
        addAuditLog({
          userId: user.id,
          userName: user.name,
          userRole: user.role,
          action: 'CONTENT_CREATE',
          target: newItem.id,
          status: 'success',
          details: `Created new content item "${formTitle}" with permission create:content`,
          ipAddress: '127.0.0.1 (Localhost)',
        });
      }
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, title: string) => {
    if (!canDelete) return;

    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      setContents(contents.filter((c) => c.id !== id));
      if (user) {
        addAuditLog({
          userId: user.id,
          userName: user.name,
          userRole: user.role,
          action: 'CONTENT_DELETE',
          target: id,
          status: 'success',
          details: `Deleted article "${title}" with permission delete:content`,
          ipAddress: '127.0.0.1 (Localhost)',
        });
      }
    }
  };

  const filteredContents = contents.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Content & Documentation Manager</h1>
          <p className="page-subtitle">
            Demonstrates fine-grained RBAC action controls based on JWT user permissions
          </p>
        </div>

        <div className="page-actions">
          {canCreate ? (
            <button className="btn-primary" onClick={openCreateModal}>
              <Plus size={16} />
              <span>Create New Article</span>
            </button>
          ) : (
            <button className="btn-disabled" title="Requires 'create:content' permission (Editor or Admin)">
              <Lock size={16} />
              <span>Create Article (Restricted)</span>
            </button>
          )}
        </div>
      </div>

      {/* Permission Banner for Viewers */}
      {user?.role === 'viewer' && (
        <div className="info-banner-viewer">
          <Eye size={18} />
          <div>
            <strong>Read-Only Mode Activated (Viewer Role)</strong>
            <p>You can view and search published articles. Creation, editing, and deletion buttons are restricted by RBAC rules.</p>
          </div>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="filter-bar">
        <div className="search-input-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search articles by title, category, or summary..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="select-box">
          <Filter size={16} />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="published">Published Only</option>
            <option value="draft">Drafts Only</option>
          </select>
        </div>
      </div>

      {/* Content Cards Grid */}
      <div className="content-grid">
        {filteredContents.map((item) => (
          <div key={item.id} className="content-card">
            <div className="card-top-bar">
              <span className="category-pill">{item.category}</span>
              <span className={`status-pill status-${item.status}`}>
                {item.status === 'published' ? 'PUBLISHED' : 'DRAFT'}
              </span>
            </div>

            <h3 className="content-title">{item.title}</h3>
            <p className="content-summary">{item.summary}</p>
            <p className="content-body-preview">{item.content}</p>

            <div className="card-meta">
              <div className="author-meta">
                <span className="author-name">By {item.author}</span>
                <span className={`role-badge-sm role-${item.authorRole}`}>{item.authorRole.toUpperCase()}</span>
              </div>
              <span className="date-meta">{new Date(item.createdAt).toLocaleDateString()}</span>
            </div>

            {/* Action Bar with RBAC Permission Guards */}
            <div className="card-action-bar">
              {/* Edit Button */}
              {canEdit ? (
                <button className="btn-icon-text" onClick={() => openEditModal(item)} title="Edit Content">
                  <Edit3 size={15} />
                  <span>Edit</span>
                </button>
              ) : (
                <button className="btn-icon-text disabled" title="Requires 'edit:content' permission">
                  <Lock size={14} />
                  <span>Edit (Locked)</span>
                </button>
              )}

              {/* Delete Button (Admin Only) */}
              {canDelete ? (
                <button
                  className="btn-icon-text text-danger"
                  onClick={() => handleDelete(item.id, item.title)}
                  title="Delete Article"
                >
                  <Trash2 size={15} />
                  <span>Delete</span>
                </button>
              ) : (
                <button className="btn-icon-text disabled" title="Requires 'delete:content' permission (Admin Only)">
                  <Lock size={14} />
                  <span>Delete (Admin Only)</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create / Edit Content Modal */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <Sparkles size={20} className="text-indigo" />
                <h3>{editingItem ? 'Edit Article' : 'Create New Article'}</h3>
              </div>
              <button className="icon-btn-close" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="modal-body form-stack">
              <div className="form-group">
                <label>Article Title</label>
                <input
                  type="text"
                  placeholder="e.g. JWT Best Practices 2026"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <select value={formCategory} onChange={(e) => setFormCategory(e.target.value)}>
                  <option value="Security Architecture">Security Architecture</option>
                  <option value="Authorization">Authorization</option>
                  <option value="OAuth2 & Web Security">OAuth2 & Web Security</option>
                  <option value="API Integration">API Integration</option>
                </select>
              </div>

              <div className="form-group">
                <label>Summary</label>
                <input
                  type="text"
                  placeholder="Short description of the content"
                  value={formSummary}
                  onChange={(e) => setFormSummary(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Main Body Content</label>
                <textarea
                  rows={4}
                  placeholder="Write full article details..."
                  value={formBody}
                  onChange={(e) => setFormBody(e.target.value)}
                ></textarea>
              </div>

              <div className="form-group">
                <label>Status</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as 'published' | 'draft')}
                  disabled={!canPublish && formStatus === 'published'}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingItem ? 'Save Changes' : 'Create Article'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
