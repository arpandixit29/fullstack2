import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { JwtInspectorModal } from '../common/JwtInspectorModal';
import { Shield, Key, LogOut, ShieldAlert, CheckCircle2, User as UserIcon, Sun, Moon } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, decodedToken, logout } = useAuth();
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('app-theme') as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const isValid = decodedToken?.isValid ?? false;

  return (
    <>
      <header className="app-navbar">
        <div className="navbar-left">
          <div className="brand-logo">
            <Shield className="brand-icon" size={24} />
            <div className="brand-text">
              <span className="brand-name">RBAC Guard</span>
              <span className="brand-tag">JWT Auth Engine</span>
            </div>
          </div>
        </div>

        <div className="navbar-right">
          {/* Theme Toggle Button */}
          <button
            className="theme-toggle-btn"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Bright Light'} Mode`}
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            <span className="theme-toggle-text">{theme === 'light' ? 'Dark Mode' : 'Bright Mode'}</span>
          </button>

          {/* JWT Token Status Pill (Clickable Inspector Trigger) */}
          <button
            className={`jwt-status-btn ${isValid ? 'status-valid' : 'status-invalid'}`}
            onClick={() => setIsInspectorOpen(true)}
            title="Click to inspect JWT header, payload & signature claims"
          >
            <Key size={15} />
            <span>{isValid ? 'JWT Token: Valid (HS256)' : 'JWT Token: Invalid / Expired'}</span>
            {isValid ? <CheckCircle2 size={14} className="status-icon" /> : <ShieldAlert size={14} className="status-icon" />}
          </button>

          {/* User Profile Badge */}
          {user && (
            <div className="user-profile-badge">
              <div className="user-avatar-container">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="user-avatar" />
                ) : (
                  <div className="avatar-placeholder">
                    <UserIcon size={16} />
                  </div>
                )}
              </div>
              <div className="user-info">
                <span className="user-name">{user.name}</span>
                <span className={`role-badge role-${user.role}`}>{user.role.toUpperCase()}</span>
              </div>
            </div>
          )}

          {/* Logout Button */}
          <button className="btn-logout" onClick={() => logout()} title="Logout and purge authentication session">
            <LogOut size={16} />
            <span className="logout-text">Logout</span>
          </button>
        </div>
      </header>

      {/* JWT Inspector Modal */}
      <JwtInspectorModal isOpen={isInspectorOpen} onClose={() => setIsInspectorOpen(false)} />
    </>
  );
};
