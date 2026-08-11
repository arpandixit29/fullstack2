import React, { createContext, useContext, useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { CalendarContextType, CalendarViewMode, FilterState, PerformanceMetrics, PlatformType, PostStatus, ScheduledPost } from '../types';

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

const PLATFORM_COLORS: Record<PlatformType, string> = {
  twitter: '#1da1f2',
  linkedin: '#0a66c2',
  facebook: '#1877f2',
  instagram: '#e4405f',
};

// Generate date helpers relative to today
const getRelativeDate = (dayOffset: number, hour: number, minute = 0): string => {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  // Return ISO string format required by FullCalendar (YYYY-MM-DDTHH:mm:ss)
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(hour)}:${pad(minute)}:00`;
};

const INITIAL_POSTS: ScheduledPost[] = [
  {
    id: 'post_01',
    title: '🚀 Launching Product V2.0 - Major Announcement',
    content: 'We are thrilled to unveil Product V2.0 with enhanced real-time analytics, AI copilot support, and zero-trust security!',
    platform: 'twitter',
    start: getRelativeDate(0, 10, 0),
    end: getRelativeDate(0, 11, 0),
    status: 'scheduled',
    author: 'Sarah Jenkins',
    color: PLATFORM_COLORS.twitter,
  },
  {
    id: 'post_02',
    title: '💡 5 Architectural Patterns for High-Scale Microservices',
    content: 'Read our technical whitepaper on event-driven architecture, CQRS, and distributed caching in modern web infrastructure.',
    platform: 'linkedin',
    start: getRelativeDate(0, 14, 0),
    end: getRelativeDate(0, 15, 30),
    status: 'scheduled',
    author: 'Alex Rivera',
    color: PLATFORM_COLORS.linkedin,
  },
  {
    id: 'post_03',
    title: '📸 Behind the Scenes: Product Engineering Team Sprint',
    content: 'A peek into our hackathon week where engineers built key features in 48 hours!',
    platform: 'instagram',
    start: getRelativeDate(1, 11, 0),
    end: getRelativeDate(1, 12, 0),
    status: 'draft',
    author: 'Elena Rostova',
    color: PLATFORM_COLORS.instagram,
  },
  {
    id: 'post_04',
    title: '📢 Weekly Community Roundup & Q&A Stream',
    content: 'Join us live on Facebook for our weekly community Q&A session discussing new API endpoints and roadmap updates.',
    platform: 'facebook',
    start: getRelativeDate(2, 16, 0),
    end: getRelativeDate(2, 17, 0),
    status: 'scheduled',
    author: 'David Chen',
    color: PLATFORM_COLORS.facebook,
  },
  {
    id: 'post_05',
    title: '⚡ Quick Tip: Optimizing React Render Performance',
    content: 'Use React.memo, useMemo, and useCallback strategically to eliminate unnecessary re-renders in large data trees.',
    platform: 'twitter',
    start: getRelativeDate(-1, 9, 30),
    end: getRelativeDate(-1, 10, 30),
    status: 'published',
    author: 'Sarah Jenkins',
    color: PLATFORM_COLORS.twitter,
  },
];

export const CalendarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [posts, setPosts] = useState<ScheduledPost[]>(INITIAL_POSTS);
  const [viewMode, setViewMode] = useState<CalendarViewMode>('timeGridWeek');
  const [selectedPost, setSelectedPost] = useState<ScheduledPost | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalDefaultDates, setModalDefaultDates] = useState<{ start: string; end: string } | null>(null);

  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    platform: 'all',
    status: 'all',
  });

  // Performance tracking refs & state
  const renderCountRef = useRef(0);
  const [lastRenderDurationMs, setLastRenderDurationMs] = useState<number>(0);

  useEffect(() => {
    renderCountRef.current += 1;
  });

  // Memoized expensive calculation: filtering posts based on query, platform, and status
  const filteredPosts = useMemo(() => {
    const startTime = performance.now();

    const result = posts.filter((post) => {
      const matchesSearch =
        filters.searchQuery === '' ||
        post.title.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        post.author.toLowerCase().includes(filters.searchQuery.toLowerCase());

      const matchesPlatform = filters.platform === 'all' || post.platform === filters.platform;
      const matchesStatus = filters.status === 'all' || post.status === filters.status;

      return matchesSearch && matchesPlatform && matchesStatus;
    });

    const endTime = performance.now();
    setLastRenderDurationMs(Number((endTime - startTime).toFixed(2)));

    return result;
  }, [posts, filters]);

  // Memoized action handlers (useCallback)
  const openCreateModalWithDates = useCallback((start: string, end: string) => {
    setModalDefaultDates({ start, end });
    setSelectedPost(null);
    setIsModalOpen(true);
  }, []);

  const addPost = useCallback((postData: Omit<ScheduledPost, 'id'>) => {
    const newPost: ScheduledPost = {
      ...postData,
      id: `post_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      color: PLATFORM_COLORS[postData.platform],
    };
    setPosts((prev) => [newPost, ...prev]);
  }, []);

  const updatePost = useCallback((id: string, updates: Partial<ScheduledPost>) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === id) {
          const updatedPlatform = updates.platform || post.platform;
          return {
            ...post,
            ...updates,
            color: PLATFORM_COLORS[updatedPlatform],
          };
        }
        return post;
      })
    );
  }, []);

  const deletePost = useCallback((id: string) => {
    setPosts((prev) => prev.filter((post) => post.id !== id));
    setSelectedPost(null);
  }, []);

  const movePost = useCallback((id: string, newStart: string, newEnd: string) => {
    setPosts((prev) =>
      prev.map((post) => (post.id === id ? { ...post, start: newStart, end: newEnd } : post))
    );
  }, []);

  // Performance stress test generator: creates count (e.g. 500) posts across current month
  const generateBulkPosts = useCallback((count = 500) => {
    const platforms: PlatformType[] = ['twitter', 'linkedin', 'facebook', 'instagram'];
    const statuses: PostStatus[] = ['scheduled', 'published', 'draft'];
    const authors = ['Alex Rivera', 'Sarah Jenkins', 'Elena Rostova', 'David Chen', 'Marcus Holloway'];
    const titles = [
      'Product Feature Spotlight',
      'Community Highlight & Story',
      'Engineering Tech Talk Announcement',
      'Weekly Industry Trend Analysis',
      'Customer Success Story',
      'API Security Best Practices',
      'Design System Components Showcase',
    ];

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const bulk: ScheduledPost[] = [];
    const pad = (n: number) => n.toString().padStart(2, '0');

    for (let i = 0; i < count; i++) {
      const day = Math.floor(Math.random() * 28) + 1;
      const hour = Math.floor(Math.random() * 14) + 8; // 8 AM to 10 PM
      const platform = platforms[i % platforms.length];
      const status = statuses[i % statuses.length];
      const author = authors[i % authors.length];
      const title = `${titles[i % titles.length]} #${i + 1}`;

      const startStr = `${year}-${pad(month + 1)}-${pad(day)}T${pad(hour)}:00:00`;
      const endStr = `${year}-${pad(month + 1)}-${pad(day)}T${pad(hour + 1)}:00:00`;

      bulk.push({
        id: `bulk_post_${i + 1}`,
        title,
        content: `Automated post content snippet for ${title}. Tested under stress load.`,
        platform,
        start: startStr,
        end: endStr,
        status,
        author,
        color: PLATFORM_COLORS[platform],
      });
    }

    setPosts(bulk);
  }, []);

  const clearAllPosts = useCallback(() => {
    setPosts([]);
    setSelectedPost(null);
  }, []);

  const performanceMetrics: PerformanceMetrics = {
    renderCount: renderCountRef.current,
    lastRenderDurationMs,
    totalEventsCount: posts.length,
  };

  const contextValue: CalendarContextType = {
    posts,
    filteredPosts,
    selectedPost,
    filters,
    viewMode,
    performanceMetrics,
    isModalOpen,
    modalDefaultDates,
    setViewMode,
    setFilters,
    setSelectedPost,
    setIsModalOpen,
    openCreateModalWithDates,
    addPost,
    updatePost,
    deletePost,
    movePost,
    generateBulkPosts,
    clearAllPosts,
  };

  return <CalendarContext.Provider value={contextValue}>{children}</CalendarContext.Provider>;
};

export const useCalendar = (): CalendarContextType => {
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error('useCalendar must be used within a CalendarProvider');
  }
  return context;
};
