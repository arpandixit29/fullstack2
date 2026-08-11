import React from 'react';
import { useCalendar } from '../../context/CalendarContext';
import { PlatformType, PostStatus } from '../../types';
import { Search, Plus, Calendar, Clock, Grid, Filter } from 'lucide-react';

export const FilterBar: React.FC = () => {
  const {
    filters,
    setFilters,
    viewMode,
    setViewMode,
    setIsModalOpen,
    setSelectedPost,
    posts,
  } = useCalendar();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFilters((prev) => ({ ...prev, searchQuery: val }));
  };

  const handlePlatformChange = (platform: PlatformType | 'all') => {
    setFilters((prev) => ({ ...prev, platform }));
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const status = e.target.value as PostStatus | 'all';
    setFilters((prev) => ({ ...prev, status }));
  };

  const handleNewPostClick = () => {
    setSelectedPost(null);
    setIsModalOpen(true);
  };

  return (
    <div className="filter-bar-header">
      {/* Search Input */}
      <div className="search-box">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          placeholder="Filter posts by title, content, or author..."
          value={filters.searchQuery}
          onChange={handleSearchChange}
        />
      </div>

      {/* Platform Filter Buttons */}
      <div className="platform-filter-group">
        <button
          className={`platform-btn ${filters.platform === 'all' ? 'active' : ''}`}
          onClick={() => handlePlatformChange('all')}
        >
          All Platforms ({posts.length})
        </button>
        <button
          className={`platform-btn twitter ${filters.platform === 'twitter' ? 'active' : ''}`}
          onClick={() => handlePlatformChange('twitter')}
        >
          Twitter
        </button>
        <button
          className={`platform-btn linkedin ${filters.platform === 'linkedin' ? 'active' : ''}`}
          onClick={() => handlePlatformChange('linkedin')}
        >
          LinkedIn
        </button>
        <button
          className={`platform-btn instagram ${filters.platform === 'instagram' ? 'active' : ''}`}
          onClick={() => handlePlatformChange('instagram')}
        >
          Instagram
        </button>
        <button
          className={`platform-btn facebook ${filters.platform === 'facebook' ? 'active' : ''}`}
          onClick={() => handlePlatformChange('facebook')}
        >
          Facebook
        </button>
      </div>

      {/* Status Select */}
      <div className="select-box-status">
        <Filter size={16} />
        <select value={filters.status} onChange={handleStatusChange}>
          <option value="all">All Statuses</option>
          <option value="scheduled">Scheduled</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Calendar View Mode Switcher */}
      <div className="view-mode-group">
        <button
          className={`view-btn ${viewMode === 'dayGridMonth' ? 'active' : ''}`}
          onClick={() => setViewMode('dayGridMonth')}
          title="Month View"
        >
          <Grid size={16} />
          <span>Month</span>
        </button>
        <button
          className={`view-btn ${viewMode === 'timeGridWeek' ? 'active' : ''}`}
          onClick={() => setViewMode('timeGridWeek')}
          title="Week View"
        >
          <Calendar size={16} />
          <span>Week</span>
        </button>
        <button
          className={`view-btn ${viewMode === 'timeGridDay' ? 'active' : ''}`}
          onClick={() => setViewMode('timeGridDay')}
          title="Day View"
        >
          <Clock size={16} />
          <span>Day</span>
        </button>
      </div>

      {/* New Post Button */}
      <button className="btn-primary" onClick={handleNewPostClick}>
        <Plus size={16} />
        <span>New Post</span>
      </button>
    </div>
  );
};

export const MemoizedFilterBar = React.memo(FilterBar);
