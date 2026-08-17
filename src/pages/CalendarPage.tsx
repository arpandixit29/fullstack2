import React, { Suspense } from 'react';
import { CalendarProvider } from '../context/CalendarContext';
import { MemoizedCalendarView } from '../components/calendar/CalendarView';
import { MemoizedFilterBar } from '../components/calendar/FilterBar';
import { MemoizedEventModal } from '../components/calendar/EventModal';
import { MemoizedEventDetailsDrawer } from '../components/calendar/EventDetailsDrawer';
import { MemoizedPerformanceMonitor } from '../components/calendar/PerformanceMonitor';
import { ErrorBoundary } from '../components/common/ErrorBoundary';

const CalendarLoadingFallback: React.FC = () => (
  <div className="calendar-loading-skeleton">
    <div className="skeleton-toolbar">
      <div className="skeleton-btn"></div>
      <div className="skeleton-title"></div>
      <div className="skeleton-btn-group">
        <div className="skeleton-btn"></div>
        <div className="skeleton-btn"></div>
        <div className="skeleton-btn"></div>
      </div>
    </div>
    <div className="skeleton-grid">
      {Array.from({ length: 35 }).map((_, i) => (
        <div key={i} className="skeleton-cell"></div>
      ))}
    </div>
    <div className="skeleton-loading-label">
      <div className="spinner-sm" style={{ borderTopColor: 'var(--primary)', borderColor: 'rgba(79,70,229,0.2)' }}></div>
      <span>Loading calendar...</span>
    </div>
  </div>
);

export const CalendarPage: React.FC = () => {
  return (
    <CalendarProvider>
      <div className="calendar-page-container">
        <div className="page-header" style={{ marginBottom: '14px' }}>
          <div>
            <h1 className="page-title">Interactive Calendar Scheduler</h1>
            <p className="page-subtitle">
              Drag-and-drop post scheduling, Day/Week/Month views, and performance diagnostics
            </p>
          </div>
        </div>

        {/* Diagnostics & Performance Monitor */}
        <MemoizedPerformanceMonitor />

        {/* Workspace */}
        <div className="calendar-workspace-box" style={{ marginTop: '14px' }}>
          <MemoizedFilterBar />
          <div style={{ height: '620px', marginTop: '14px' }}>
            <ErrorBoundary>
              <Suspense fallback={<CalendarLoadingFallback />}>
                <MemoizedCalendarView />
              </Suspense>
            </ErrorBoundary>
          </div>
        </div>

        {/* Modals & Drawers */}
        <MemoizedEventModal />
        <MemoizedEventDetailsDrawer />
      </div>
    </CalendarProvider>
  );
};

