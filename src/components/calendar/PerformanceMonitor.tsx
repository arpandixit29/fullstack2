import React from 'react';
import { useCalendar } from '../../context/CalendarContext';
import { Zap, Trash2, Cpu, CheckCircle2 } from 'lucide-react';

export const PerformanceMonitor: React.FC = () => {
  const { performanceMetrics, generateBulkPosts, clearAllPosts } = useCalendar();

  const isFast = performanceMetrics.lastRenderDurationMs < 16; // 16ms target for 60 FPS

  return (
    <div className="perf-monitor-bar">
      <div className="perf-metric-group">
        <div className="perf-badge">
          <Cpu size={16} className="text-indigo" />
          <span>Render Performance Diagnostic</span>
        </div>

        <div className="perf-stat">
          <span className="stat-label">Total Events Loaded:</span>
          <span className="stat-val highlight">{performanceMetrics.totalEventsCount}</span>
        </div>

        <div className="perf-stat">
          <span className="stat-label">Filter Processing Time:</span>
          <span className={`stat-val ${isFast ? 'text-emerald' : 'text-danger'}`}>
            {performanceMetrics.lastRenderDurationMs} ms
          </span>
        </div>

        <div className="perf-stat">
          <span className="stat-label">State Re-renders:</span>
          <span className="stat-val">{performanceMetrics.renderCount}</span>
        </div>

        <div className="fps-indicator">
          <CheckCircle2 size={14} className="text-emerald" />
          <span>{isFast ? '60 FPS Target Achieved (useMemo & useCallback active)' : 'Heavy Render'}</span>
        </div>
      </div>

      <div className="perf-action-group">
        <button
          className="btn-warning btn-sm"
          onClick={() => generateBulkPosts(500)}
          title="Load 500+ events across month grid to benchmark rendering performance"
        >
          <Zap size={14} />
          <span>Generate 500+ Bulk Events</span>
        </button>

        <button className="btn-secondary btn-sm" onClick={clearAllPosts} title="Clear all calendar events">
          <Trash2 size={14} />
          <span>Clear Events</span>
        </button>
      </div>
    </div>
  );
};

export const MemoizedPerformanceMonitor = React.memo(PerformanceMonitor);
