import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Calendar, FileText, Users, ShieldCheck, Lock, ChevronRight } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user, hasPermission } = useAuth();

  const canManageUsers = hasPermission('manage:users');
  const canViewAudit = hasPermission('audit:logs');

  return (
    <aside className="app-sidebar">
      <div className="sidebar-section-title">MAIN MENU</div>
      <nav className="sidebar-nav">
        <NavLink
          to="/dashboard"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <LayoutDashboard size={18} />
          <span>Dashboard Overview</span>
          <ChevronRight size={14} className="nav-arrow" />
        </NavLink>

        <NavLink
          to="/calendar"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <Calendar size={18} />
          <span>Calendar Scheduler</span>
          <span className="badge-new">PRO</span>
          <ChevronRight size={14} className="nav-arrow" />
        </NavLink>

        <NavLink
          to="/content"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <FileText size={18} />
          <span>Content Manager</span>
          <ChevronRight size={14} className="nav-arrow" />
        </NavLink>

        {/* Dynamically displayed based on RBAC permission 'manage:users' */}
        {canManageUsers ? (
          <NavLink
            to="/users"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <Users size={18} />
            <span>User Management</span>
            <span className="badge-admin">Admin</span>
            <ChevronRight size={14} className="nav-arrow" />
          </NavLink>
        ) : (
          <div className="nav-link disabled" title="Requires Admin privileges (manage:users permission)">
            <Users size={18} />
            <span>User Management</span>
            <Lock size={14} className="lock-icon" />
          </div>
        )}

        {/* Dynamically displayed based on RBAC permission 'audit:logs' */}
        {canViewAudit ? (
          <NavLink
            to="/audit-logs"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <ShieldCheck size={18} />
            <span>Security Audit Logs</span>
            <span className="badge-admin">Admin</span>
            <ChevronRight size={14} className="nav-arrow" />
          </NavLink>
        ) : (
          <div className="nav-link disabled" title="Requires Admin privileges (audit:logs permission)">
            <ShieldCheck size={18} />
            <span>Security Audit Logs</span>
            <Lock size={14} className="lock-icon" />
          </div>
        )}
      </nav>

      {/* Role Summary Widget */}
      <div className="sidebar-footer-widget">
        <div className="widget-header">
          <span className="widget-title">Session Privilege Level</span>
        </div>
        <div className="widget-body">
          <div className="role-indicator">
            <span className={`role-dot role-dot-${user?.role}`}></span>
            <span className="role-name">{user?.role?.toUpperCase()} ROLE</span>
          </div>
          <p className="widget-desc">
            {user?.role === 'admin' && 'Full system control & user admin permissions.'}
            {user?.role === 'editor' && 'Create, edit & publish content permissions.'}
            {user?.role === 'viewer' && 'Read-only access across application views.'}
          </p>
          <div className="perm-counter">
            Permissions granted: <strong>{user?.permissions?.length || 0} / 9</strong>
          </div>
        </div>
      </div>
    </aside>
  );
};
