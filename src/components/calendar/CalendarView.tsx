import React, { useMemo, useCallback, useRef, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useCalendar } from '../../context/CalendarContext';

interface EventClickInfo {
  event: {
    id: string;
    title: string;
  };
}

interface DateSelectInfo {
  startStr: string;
  endStr: string;
}

interface EventDropInfo {
  event: {
    id: string;
    start: Date | null;
    end: Date | null;
  };
}

interface EventResizeInfo {
  event: {
    id: string;
    start: Date;
    end: Date;
  };
}

interface EventContentInfo {
  event: {
    title: string;
    extendedProps: {
      platform: string;
      status: string;
      author: string;
      content?: string;
    };
  };
}

export const CalendarView: React.FC = () => {
  const {
    filteredPosts,
    viewMode,
    setSelectedPost,
    openCreateModalWithDates,
    movePost,
  } = useCalendar();

  // Ref to FullCalendar API — lets us change views without remounting the whole calendar
  const calendarRef = useRef<FullCalendar>(null);

  // When viewMode changes from FilterBar, use the FullCalendar API to switch view
  // This avoids the expensive key={viewMode} remount pattern that caused the blank screen
  useEffect(() => {
    const api = calendarRef.current?.getApi();
    if (api && api.view.type !== viewMode) {
      api.changeView(viewMode);
    }
  }, [viewMode]);

  // Transform ScheduledPost domain models into FullCalendar event objects (useMemo for performance)
  const calendarEvents = useMemo(() => {
    return filteredPosts.map((post) => ({
      id: post.id,
      title: post.title,
      start: post.start,
      end: post.end,
      backgroundColor: post.color || '#6366f1',
      borderColor: post.color || '#6366f1',
      extendedProps: {
        platform: post.platform,
        status: post.status,
        author: post.author,
        content: post.content,
      },
    }));
  }, [filteredPosts]);

  // Stable event handlers using useCallback
  const handleEventClick = useCallback(
    (clickInfo: EventClickInfo) => {
      const postId = clickInfo.event.id;
      const foundPost = filteredPosts.find((p) => p.id === postId);
      if (foundPost) {
        setSelectedPost(foundPost);
      }
    },
    [filteredPosts, setSelectedPost]
  );

  const handleDateSelect = useCallback(
    (selectInfo: DateSelectInfo) => {
      const startStr = selectInfo.startStr.includes('T')
        ? selectInfo.startStr.substring(0, 19)
        : `${selectInfo.startStr}T09:00:00`;
      const endStr = selectInfo.endStr.includes('T')
        ? selectInfo.endStr.substring(0, 19)
        : `${selectInfo.startStr}T10:00:00`;

      openCreateModalWithDates(startStr, endStr);
    },
    [openCreateModalWithDates]
  );

  const handleEventDrop = useCallback(
    (dropInfo: EventDropInfo) => {
      const { event } = dropInfo;
      const newStart = event.start ? event.start.toISOString().substring(0, 19) : '';
      const newEnd = event.end
        ? event.end.toISOString().substring(0, 19)
        : event.start
        ? new Date(event.start.getTime() + 3600000).toISOString().substring(0, 19)
        : '';

      movePost(event.id, newStart, newEnd);
    },
    [movePost]
  );

  const handleEventResize = useCallback(
    (resizeInfo: EventResizeInfo) => {
      const { event } = resizeInfo;
      const newStart = event.start.toISOString().substring(0, 19);
      const newEnd = event.end.toISOString().substring(0, 19);

      movePost(event.id, newStart, newEnd);
    },
    [movePost]
  );

  // Custom Event Element Content Renderer
  const renderEventContent = useCallback((eventInfo: EventContentInfo) => {
    const { platform, status, author } = eventInfo.event.extendedProps;
    const title = eventInfo.event.title;

    return (
      <div className={`fc-custom-event-card platform-${platform}`}>
        <div className="event-header-row">
          <span className={`platform-badge-mini ${platform}`}>{platform.toUpperCase()}</span>
          <span className={`status-dot status-dot-${status}`} title={`Status: ${status}`}></span>
        </div>
        <div className="event-title-text">{title}</div>
        <div className="event-author-text">By {author}</div>
      </div>
    );
  }, []);

  return (
    <div className="calendar-wrapper-container">
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin] as any}
        initialView={viewMode}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        editable={true}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        weekends={true}
        events={calendarEvents}
        eventClick={handleEventClick as any}
        select={handleDateSelect as any}
        eventDrop={handleEventDrop as any}
        eventResize={handleEventResize as any}
        eventContent={renderEventContent as any}
        height="100%"
        slotMinTime="07:00:00"
        slotMaxTime="22:00:00"
        allDaySlot={true}
        nowIndicator={true}
        scrollTime={`${new Date().getHours().toString().padStart(2, '0')}:00:00`}
      />
    </div>
  );
};

export const MemoizedCalendarView = React.memo(CalendarView);
