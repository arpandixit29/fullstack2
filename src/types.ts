export type PlatformType = 'twitter' | 'linkedin' | 'facebook' | 'instagram';

export type PostStatus = 'scheduled' | 'published' | 'draft' | 'cancelled';

export type CalendarViewMode = 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay';

export interface ScheduledPost {
  id: string;
  title: string;
  content: string;
  platform: PlatformType;
  start: string; // ISO date string e.g. '2026-08-11T10:00:00'
  end: string;   // ISO date string e.g. '2026-08-11T11:00:00'
  status: PostStatus;
  author: string;
  color?: string;
  mediaUrl?: string;
}

export interface FilterState {
  searchQuery: string;
  platform: PlatformType | 'all';
  status: PostStatus | 'all';
}

export interface PerformanceMetrics {
  renderCount: number;
  lastRenderDurationMs: number;
  totalEventsCount: number;
}

export interface CalendarContextType {
  posts: ScheduledPost[];
  filteredPosts: ScheduledPost[];
  selectedPost: ScheduledPost | null;
  filters: FilterState;
  viewMode: CalendarViewMode;
  performanceMetrics: PerformanceMetrics;
  isModalOpen: boolean;
  modalDefaultDates: { start: string; end: string } | null;
  
  // Actions
  setViewMode: (mode: CalendarViewMode) => void;
  setFilters: (updater: (prev: FilterState) => FilterState) => void;
  setSelectedPost: (post: ScheduledPost | null) => void;
  setIsModalOpen: (open: boolean) => void;
  openCreateModalWithDates: (start: string, end: string) => void;
  addPost: (post: Omit<ScheduledPost, 'id'>) => void;
  updatePost: (id: string, updates: Partial<ScheduledPost>) => void;
  deletePost: (id: string) => void;
  movePost: (id: string, newStart: string, newEnd: string) => void;
  generateBulkPosts: (count?: number) => void;
  clearAllPosts: () => void;
}
