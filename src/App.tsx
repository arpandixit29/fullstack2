import React from 'react';
import { CalendarProvider } from './context/CalendarContext';
import { MemoizedCalendarView } from './components/calendar/CalendarView';
import { MemoizedFilterBar } from './components/calendar/FilterBar';
import { MemoizedEventModal } from './components/calendar/EventModal';
import { MemoizedEventDetailsDrawer } from './components/calendar/EventDetailsDrawer';
import { MemoizedPerformanceMonitor } from './components/calendar/PerformanceMonitor';
import { Calendar, ShieldCheck, Sparkles } from 'lucide-react';
import './styles.css';

const CalendarAppContent: React.FC = () => {
  return (
    <div className="calendar-app-shell">
      {/* Navbar Header */}
      <header className="calendar-navbar">
        <div className="nav-brand">
          <Calendar className="brand-logo-icon" size={26} />
          <div>
            <h1 className="nav-title">Chronos Calendar Engine</h1>
            <p className="nav-sub">Interactive Drag & Drop Social Post Scheduling & Performance Suite</p>
          </div>
        </div>

        <div className="nav-right-badges">
          <div className="tech-badge">
            <Sparkles size={14} className="text-indigo" />
            <span>React 18 + FullCalendar</span>
          </div>
          <div className="tech-badge">
            <ShieldCheck size={14} className="text-emerald" />
            <span>useMemo & useCallback Optimized</span>
          </div>
        </div>
      </header>

      {/* Diagnostics & Performance Monitor */}
      <MemoizedPerformanceMonitor />

      {/* Main Workspace */}
      <main className="calendar-main-workspace">
        <MemoizedFilterBar />
        <MemoizedCalendarView />
      </main>

      {/* Modals & Drawers */}
      <MemoizedEventModal />
      <MemoizedEventDetailsDrawer />
    </div>
  );
};

export default function App() {
  return (
    <CalendarProvider>
      <CalendarAppContent />
    </CalendarProvider>
  );
}
