import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import App from '../App';

// Mock FullCalendar for JSDOM unit tests to avoid ES class constructor transpilation mismatch in JSDOM
vi.mock('@fullcalendar/react', () => ({
  default: React.forwardRef((props: any, _ref: any) => (
    <div data-testid="full-calendar-mock" data-view={props.initialView}>
      <div className="fc-toolbar-title">August 2026</div>
      <div className="fc-events-list">
        {props.events?.map((evt: any) => (
          <div
            key={evt.id}
            data-testid={`event-${evt.id}`}
            onClick={() => props.eventClick && props.eventClick({ event: { id: evt.id } })}
          >
            {evt.title}
          </div>
        ))}
      </div>
    </div>
  )),
}));

describe('Interactive Calendar Scheduling UI & Components', () => {
  it('renders application navbar and performance monitor widget', () => {
    render(<App />);

    expect(screen.getByText('Chronos Calendar Engine')).toBeInTheDocument();
    expect(screen.getByText('Render Performance Diagnostic')).toBeInTheDocument();
    expect(screen.getByText('Total Events Loaded:')).toBeInTheDocument();
  });

  it('renders filter bar buttons and view mode switcher', () => {
    render(<App />);

    expect(screen.getByText(/All Platforms/i)).toBeInTheDocument();
    expect(screen.getByText('Twitter')).toBeInTheDocument();
    expect(screen.getByText('LinkedIn')).toBeInTheDocument();
    expect(screen.getByText('Instagram')).toBeInTheDocument();
    expect(screen.getByText('Facebook')).toBeInTheDocument();
    expect(screen.getByText('New Post')).toBeInTheDocument();
  });

  it('opens post creation modal when clicking "New Post"', () => {
    render(<App />);

    const newPostBtn = screen.getByText('New Post');
    fireEvent.click(newPostBtn);

    expect(screen.getByText('Schedule New Social Post')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g. Product V2.0 Announcement Launch')).toBeInTheDocument();
  });

  it('filters posts when platform button is clicked', () => {
    render(<App />);

    const twitterBtn = screen.getByText('Twitter');
    fireEvent.click(twitterBtn);

    expect(twitterBtn).toHaveClass('active');
  });

  it('generates 500+ bulk events when clicking performance test button', () => {
    render(<App />);

    const bulkBtn = screen.getByText('Generate 500+ Bulk Events');
    fireEvent.click(bulkBtn);

    expect(screen.getByText('500')).toBeInTheDocument();
  });
});
