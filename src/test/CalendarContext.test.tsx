import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import React from 'react';
import { CalendarProvider, useCalendar } from '../context/CalendarContext';

const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <CalendarProvider>{children}</CalendarProvider>
);

describe('CalendarContext & State Dispatchers', () => {
  it('initializes with default mock scheduled posts', () => {
    const { result } = renderHook(() => useCalendar(), { wrapper });
    expect(result.current.posts.length).toBeGreaterThan(0);
    expect(result.current.filteredPosts.length).toBeGreaterThan(0);
  });

  it('adds a new scheduled post dynamically', () => {
    const { result } = renderHook(() => useCalendar(), { wrapper });
    const initialCount = result.current.posts.length;

    act(() => {
      result.current.addPost({
        title: 'New Test Event',
        content: 'Testing creation logic',
        platform: 'twitter',
        start: '2026-08-15T10:00:00',
        end: '2026-08-15T11:00:00',
        status: 'scheduled',
        author: 'Tester',
      });
    });

    expect(result.current.posts.length).toBe(initialCount + 1);
    expect(result.current.posts[0].title).toBe('New Test Event');
  });

  it('reschedules a post start and end dates (drag and drop simulation)', () => {
    const { result } = renderHook(() => useCalendar(), { wrapper });
    const targetPost = result.current.posts[0];
    const newStart = '2026-08-20T14:00:00';
    const newEnd = '2026-08-20T15:00:00';

    act(() => {
      result.current.movePost(targetPost.id, newStart, newEnd);
    });

    const updated = result.current.posts.find((p) => p.id === targetPost.id);
    expect(updated?.start).toBe(newStart);
    expect(updated?.end).toBe(newEnd);
  });

  it('updates post details and status', () => {
    const { result } = renderHook(() => useCalendar(), { wrapper });
    const targetPost = result.current.posts[0];

    act(() => {
      result.current.updatePost(targetPost.id, {
        title: 'Updated Post Title',
        status: 'published',
      });
    });

    const updated = result.current.posts.find((p) => p.id === targetPost.id);
    expect(updated?.title).toBe('Updated Post Title');
    expect(updated?.status).toBe('published');
  });

  it('deletes a post correctly', () => {
    const { result } = renderHook(() => useCalendar(), { wrapper });
    const targetPost = result.current.posts[0];
    const initialCount = result.current.posts.length;

    act(() => {
      result.current.deletePost(targetPost.id);
    });

    expect(result.current.posts.length).toBe(initialCount - 1);
    expect(result.current.posts.find((p) => p.id === targetPost.id)).toBeUndefined();
  });

  it('filters posts accurately by platform using useMemo', () => {
    const { result } = renderHook(() => useCalendar(), { wrapper });

    act(() => {
      result.current.setFilters((prev) => ({ ...prev, platform: 'twitter' }));
    });

    expect(
      result.current.filteredPosts.every((p) => p.platform === 'twitter')
    ).toBe(true);
  });

  it('handles bulk post generation for performance stress testing (500 events)', () => {
    const { result } = renderHook(() => useCalendar(), { wrapper });

    act(() => {
      result.current.generateBulkPosts(500);
    });

    expect(result.current.posts.length).toBe(500);
    expect(result.current.performanceMetrics.totalEventsCount).toBe(500);
  });
});
