import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowLeft, LogOut, Lock } from 'lucide-react';

export const UnauthorizedPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const attemptedPath = (location.state as any)?.from || 'restricted section';

  return (
    <div className="unauthorized-container">
      <div className="unauthorized-card">
        <div className="unauthorized-icon-box">
          <ShieldAlert size={48} className="text-danger-animated" />
        </div>

        <h2>403 — Access Denied & Forbidden</h2>
        <p className="unauthorized-subtitle">
          Your current session role <span className={`role-badge role-${user?.role}`}>{user?.role?.toUpperCase()}</span> does not have authorization to view this protected resource.
        </p>

        <div className="security-reason-box">
          <div className="reason-header">
            <Lock size={16} />
            <span>RBAC Security Policy Violation</span>
          </div>
          <div className="reason-body">
            <p>Attempted Access: <code>{attemptedPath}</code></p>
            <p>Required Privilege: <code>manage:users</code> or <code>audit:logs</code> permission claim in JWT.</p>
          </div>
        </div>

        <div className="unauthorized-actions">
          <button className="btn-secondary" onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={16} />
            <span>Return to Dashboard</span>
          </button>
          <button className="btn-primary" onClick={() => logout('User requested role switch')}>
            <LogOut size={16} />
            <span>Switch User Account</span>
          </button>
        </div>
      </div>
    </div>
  );
};
