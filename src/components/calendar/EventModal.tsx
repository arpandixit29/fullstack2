import React, { useState, useEffect } from 'react';
import { useCalendar } from '../../context/CalendarContext';
import { PlatformType, PostStatus } from '../../types';
import { Calendar, Clock, Share2, User, Sparkles, X } from 'lucide-react';

export const EventModal: React.FC = () => {
  const {
    isModalOpen,
    setIsModalOpen,
    modalDefaultDates,
    selectedPost,
    setSelectedPost,
    addPost,
    updatePost,
  } = useCalendar();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [platform, setPlatform] = useState<PlatformType>('twitter');
  const [status, setStatus] = useState<PostStatus>('scheduled');
  const [author, setAuthor] = useState('Sarah Jenkins');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (selectedPost) {
      setTitle(selectedPost.title);
      setContent(selectedPost.content);
      setPlatform(selectedPost.platform);
      setStatus(selectedPost.status);
      setAuthor(selectedPost.author);
      setStartDate(selectedPost.start);
      setEndDate(selectedPost.end);
    } else if (modalDefaultDates) {
      setTitle('');
      setContent('');
      setPlatform('twitter');
      setStatus('scheduled');
      setAuthor('Sarah Jenkins');
      setStartDate(modalDefaultDates.start);
      setEndDate(modalDefaultDates.end);
    }
  }, [selectedPost, modalDefaultDates, isModalOpen]);

  if (!isModalOpen) return null;

  const handleClose = () => {
    setIsModalOpen(false);
    setSelectedPost(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !startDate || !endDate) return;

    if (selectedPost) {
      updatePost(selectedPost.id, {
        title,
        content,
        platform,
        status,
        author,
        start: startDate,
        end: endDate,
      });
    } else {
      addPost({
        title,
        content,
        platform,
        status,
        author,
        start: startDate,
        end: endDate,
      });
    }

    handleClose();
  };

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div className="modal-container event-editor-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <Sparkles size={22} className="text-indigo" />
            <h3>{selectedPost ? 'Edit Scheduled Post' : 'Schedule New Social Post'}</h3>
          </div>
          <button className="icon-btn-close" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body form-stack">
          <div className="form-group">
            <label>Post Title / Summary</label>
            <input
              type="text"
              placeholder="e.g. Product V2.0 Announcement Launch"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-row-2col">
            <div className="form-group">
              <label>Target Social Platform</label>
              <div className="select-wrapper">
                <Share2 size={16} className="input-icon" />
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value as PlatformType)}
                >
                  <option value="twitter">Twitter / X</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="facebook">Facebook</option>
                  <option value="instagram">Instagram</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Scheduling Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as PostStatus)}>
                <option value="scheduled">Scheduled</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="form-row-2col">
            <div className="form-group">
              <label>Start Date & Time</label>
              <div className="input-icon-wrapper">
                <Calendar size={16} className="input-icon" />
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>End Date & Time</label>
              <div className="input-icon-wrapper">
                <Clock size={16} className="input-icon" />
                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Author / Assignee</label>
            <div className="input-icon-wrapper">
              <User size={16} className="input-icon" />
              <input
                type="text"
                placeholder="Author Name"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Post Body Content</label>
            <textarea
              rows={4}
              placeholder="Write full post copy, hashtags, and links..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            ></textarea>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={handleClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {selectedPost ? 'Save Post Changes' : 'Schedule Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const MemoizedEventModal = React.memo(EventModal);
