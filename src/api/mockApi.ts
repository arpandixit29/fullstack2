import { Draft, PublishedPost, Platform, PLATFORM_DETAILS } from '../types';

// Mock in-memory storage for async API simulations
let mockDrafts: Draft[] = [];
let mockPosts: PublishedPost[] = [];

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockApi = {
  // Fetch initial platforms configuration
  async fetchPlatforms(): Promise<Record<Platform, typeof PLATFORM_DETAILS[Platform]>> {
    await delay(200);
    return PLATFORM_DETAILS;
  },

  // Draft Async Operations
  async fetchDrafts(): Promise<Draft[]> {
    await delay(300);
    return [...mockDrafts];
  },

  async saveDraft(draftData: { id?: string; title: string; content: string; platforms: Platform[] }): Promise<Draft> {
    await delay(400);
    const now = new Date().toISOString();
    const existingIndex = mockDrafts.findIndex((d) => d.id === draftData.id);

    if (existingIndex >= 0) {
      const updated: Draft = {
        ...draftData,
        id: draftData.id!,
        savedAt: now,
      };
      mockDrafts[existingIndex] = updated;
      return updated;
    } else {
      const created: Draft = {
        ...draftData,
        id: draftData.id || String(Date.now()),
        savedAt: now,
      };
      mockDrafts.push(created);
      return created;
    }
  },

  async deleteDraft(id: string): Promise<string> {
    await delay(300);
    mockDrafts = mockDrafts.filter((d) => d.id !== id);
    return id;
  },

  // Published Posts Async Operations
  async fetchPosts(): Promise<PublishedPost[]> {
    await delay(300);
    return [...mockPosts];
  },

  async publishPost(postData: Omit<PublishedPost, 'publishedAt' | 'id'>): Promise<PublishedPost> {
    await delay(400);
    const newPost: PublishedPost = {
      ...postData,
      id: String(Date.now()),
      publishedAt: new Date().toISOString(),
    };
    mockPosts.push(newPost);
    return newPost;
  },

  async deletePost(id: string): Promise<string> {
    await delay(300);
    mockPosts = mockPosts.filter((p) => p.id !== id);
    return id;
  },
};
