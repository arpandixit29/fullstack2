// ==========================================
// 1. Original Multi-Platform Post Composer Types
// ==========================================

export type Platform = 'Twitter/X' | 'LinkedIn' | 'Instagram' | 'Facebook' | 'Threads';

export interface PlatformInfo {
  name: Platform;
  limit: number;
  color: string;
  bgColor: string;
  description: string;
}

export const PLATFORM_DETAILS: Record<Platform, PlatformInfo> = {
  'Twitter/X': {
    name: 'Twitter/X',
    limit: 280,
    color: '#0f1419',
    bgColor: '#e7e7e8',
    description: 'Short form posts & updates',
  },
  LinkedIn: {
    name: 'LinkedIn',
    limit: 3000,
    color: '#0a66c2',
    bgColor: '#e0f2fe',
    description: 'Professional networking posts',
  },
  Instagram: {
    name: 'Instagram',
    limit: 2200,
    color: '#d62976',
    bgColor: '#fce7f3',
    description: 'Photo & video captions',
  },
  Facebook: {
    name: 'Facebook',
    limit: 63206,
    color: '#1877f2',
    bgColor: '#dbeafe',
    description: 'Long form community posts',
  },
  Threads: {
    name: 'Threads',
    limit: 500,
    color: '#101010',
    bgColor: '#f3f4f6',
    description: 'Text discussions & thoughts',
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


// ==========================================
// 2. JWT Authentication & RBAC System Types
// ==========================================

export type Role = 'admin' | 'editor' | 'viewer';

export type Permission =
  | 'read:all'
  | 'create:content'
  | 'edit:content'
  | 'delete:content'
  | 'publish:content'
  | 'manage:users'
  | 'view:analytics'
  | 'manage:settings'
  | 'audit:logs';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  permissions: Permission[];
  avatarUrl?: string;
  title?: string;
  status: 'active' | 'inactive';
}

export interface JwtHeader {
  alg: string;
  typ: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  name: string;
  role: Role;
  permissions: Permission[];
  iat: number;
  exp: number;
  iss: string;
}

export interface DecodedJwtToken {
  header: JwtHeader;
  payload: JwtPayload;
  signature: string;
  rawToken: string;
  isExpired: boolean;
  isValid: boolean;
}

export interface ContentItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  author: string;
  authorRole: Role;
  status: 'published' | 'draft' | 'under_review';
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: Role;
  action: string;
  target: string;
  status: 'success' | 'warning' | 'denied';
  details: string;
  ipAddress: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  decodedToken: DecodedJwtToken | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: (reason?: string) => void;
  hasPermission: (permission: Permission) => boolean;
  hasRole: (roles: Role | Role[]) => boolean;
  refreshToken: () => Promise<void>;
  tamperToken: () => void;
}


// ==========================================
// 3. Interactive Calendar Scheduler Types
// ==========================================

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
