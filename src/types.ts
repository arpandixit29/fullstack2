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
