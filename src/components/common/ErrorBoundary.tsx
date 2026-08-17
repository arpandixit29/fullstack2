import React from 'react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="error-boundary-box">
          <div className="error-boundary-icon">⚠️</div>
          <h3 className="error-boundary-title">Calendar failed to load</h3>
          <p className="error-boundary-msg">
            {this.state.error?.message || 'An unexpected error occurred loading the calendar.'}
          </p>
          <button className="btn-primary" onClick={this.handleRetry}>
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
