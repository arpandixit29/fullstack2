import React from 'react';
import { CalendarProvider } from '../context/CalendarContext';
import { MemoizedCalendarView } from '../components/calendar/CalendarView';
import { MemoizedFilterBar } from '../components/calendar/FilterBar';
import { MemoizedEventModal } from '../components/calendar/EventModal';
import { MemoizedEventDetailsDrawer } from '../components/calendar/EventDetailsDrawer';
import { MemoizedPerformanceMonitor } from '../components/calendar/PerformanceMonitor';

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
            <MemoizedCalendarView />
          </div>
        </div>

        {/* Modals & Drawers */}
        <MemoizedEventModal />
        <MemoizedEventDetailsDrawer />
      </div>
    </CalendarProvider>
  );
};
