import React, { useMemo, useCallback, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useCalendar } from '../../context/CalendarContext';

export const CalendarView: React.FC = () => {
  const {
    filteredPosts,
    viewMode,
    setSelectedPost,
    openCreateModalWithDates,
    movePost,
  } = useCalendar();

  const calendarRef = useRef<any>(null);

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
    (clickInfo: any) => {
      const postId = clickInfo.event.id;
      const foundPost = filteredPosts.find((p) => p.id === postId);
      if (foundPost) {
        setSelectedPost(foundPost);
      }
    },
    [filteredPosts, setSelectedPost]
  );

  const handleDateSelect = useCallback(
    (selectInfo: any) => {
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
    (dropInfo: any) => {
      const { event } = dropInfo;
      const newStart = event.start ? event.start.toISOString().substring(0, 19) : '';
      const newEnd = event.end
        ? event.end.toISOString().substring(0, 19)
        : new Date(event.start.getTime() + 3600000).toISOString().substring(0, 19);

      movePost(event.id, newStart, newEnd);
    },
    [movePost]
  );

  const handleEventResize = useCallback(
    (resizeInfo: any) => {
      const { event } = resizeInfo;
      const newStart = event.start.toISOString().substring(0, 19);
      const newEnd = event.end.toISOString().substring(0, 19);

      movePost(event.id, newStart, newEnd);
    },
    [movePost]
  );

  // Custom Event Element Content Renderer
  const renderEventContent = useCallback((eventInfo: any) => {
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
        key={viewMode} // Re-bind calendar when view mode changes
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
        eventClick={handleEventClick}
        select={handleDateSelect}
        eventDrop={handleEventDrop}
        eventResize={handleEventResize}
        eventContent={renderEventContent}
        height="100%"
        slotMinTime="07:00:00"
        slotMaxTime="22:00:00"
        allDaySlot={false}
      />
    </div>
  );
};

export const MemoizedCalendarView = React.memo(CalendarView);
