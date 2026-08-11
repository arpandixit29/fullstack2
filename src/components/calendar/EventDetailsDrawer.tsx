import React from 'react';
import { useCalendar } from '../../context/CalendarContext';
import { Edit3, Trash2, Calendar, Clock, User, Share2, X, CheckCircle, AlertCircle } from 'lucide-react';

export const EventDetailsDrawer: React.FC = () => {
  const { selectedPost, setSelectedPost, setIsModalOpen, deletePost, updatePost } = useCalendar();

  if (!selectedPost) return null;

  const handleClose = () => setSelectedPost(null);

  const handleEditClick = () => {
    setIsModalOpen(true);
  };

  const handleDeleteClick = () => {
    if (window.confirm(`Are you sure you want to delete post "${selectedPost.title}"?`)) {
      deletePost(selectedPost.id);
    }
  };

  const handleToggleStatus = () => {
    const nextStatus =
      selectedPost.status === 'scheduled'
        ? 'published'
        : selectedPost.status === 'published'
        ? 'draft'
        : 'scheduled';
    updatePost(selectedPost.id, { status: nextStatus });
    setSelectedPost({ ...selectedPost, status: nextStatus });
  };

  return (
    <div className="drawer-backdrop" onClick={handleClose}>
      <aside className="drawer-container" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="drawer-header">
          <div className="drawer-title-group">
            <span className={`platform-pill ${selectedPost.platform}`}>
              {selectedPost.platform.toUpperCase()}
            </span>
            <span className={`status-pill status-${selectedPost.status}`}>
              {selectedPost.status.toUpperCase()}
            </span>
          </div>
          <button className="icon-btn-close" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="drawer-body">
          <h2 className="drawer-post-title">{selectedPost.title}</h2>

          <div className="meta-card">
            <div className="meta-row">
              <Calendar size={16} className="text-indigo" />
              <span>Start: <strong>{new Date(selectedPost.start).toLocaleString()}</strong></span>
            </div>
            <div className="meta-row">
              <Clock size={16} className="text-indigo" />
              <span>End: <strong>{new Date(selectedPost.end).toLocaleString()}</strong></span>
            </div>
            <div className="meta-row">
              <User size={16} className="text-indigo" />
              <span>Author: <strong>{selectedPost.author}</strong></span>
            </div>
          </div>

          <div className="post-content-box">
            <label className="content-label">Post Copy & Content</label>
            <p className="post-body-text">{selectedPost.content || 'No detailed body text provided.'}</p>
          </div>

          <div className="status-toggle-card">
            <div className="status-left">
              <CheckCircle size={18} className="text-emerald" />
              <div>
                <span className="status-card-title">Quick Status Switcher</span>
                <span className="status-card-sub">Current: {selectedPost.status}</span>
              </div>
            </div>
            <button className="btn-secondary btn-sm" onClick={handleToggleStatus}>
              Toggle Status
            </button>
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="drawer-footer">
          <button className="btn-secondary" onClick={handleEditClick}>
            <Edit3 size={16} />
            <span>Edit Details</span>
          </button>
          <button className="btn-danger-outline" onClick={handleDeleteClick}>
            <Trash2 size={16} />
            <span>Delete Post</span>
          </button>
        </div>
      </aside>
    </div>
  );
};

export const MemoizedEventDetailsDrawer = React.memo(EventDetailsDrawer);
