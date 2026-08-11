import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="unauthorized-container">
      <div className="unauthorized-card">
        <div className="unauthorized-icon-box text-indigo">
          <FileQuestion size={48} />
        </div>
        <h2>404 — Page Not Found</h2>
        <p className="unauthorized-subtitle">
          The requested page URL does not exist or has been moved.
        </p>
        <div className="unauthorized-actions">
          <Link to="/dashboard" className="btn-primary">
            <Home size={16} />
            <span>Go to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
