import React from 'react';
import { useAuth } from '../context/AuthContext';
import { PermissionGuard } from '../components/common/PermissionGuard';
import { Link } from 'react-router-dom';
import { Shield, Key, Users, FileText, Activity, Check, X, ShieldAlert } from 'lucide-react';
import { getRemainingTtl } from '../services/jwtService';

export const DashboardPage: React.FC = () => {
  const { user, decodedToken, hasPermission } = useAuth();

  const ttl = decodedToken?.payload?.exp
    ? getRemainingTtl(decodedToken.payload.exp).text
    : 'Active';

  const permissionsList = [
    { key: 'read:all', label: 'Read All Content & Data' },
    { key: 'create:content', label: 'Create Articles & Content' },
    { key: 'edit:content', label: 'Edit & Update Content' },
    { key: 'publish:content', label: 'Publish Draft Content' },
    { key: 'delete:content', label: 'Delete Content & Resources' },
    { key: 'manage:users', label: 'User Role Administration' },
    { key: 'view:analytics', label: 'View System Analytics' },
    { key: 'manage:settings', label: 'Configure System Settings' },
    { key: 'audit:logs', label: 'View Security Audit Logs' },
  ];

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Security & RBAC Control Dashboard</h1>
          <p className="page-subtitle">
            Welcome back, <strong>{user?.name}</strong>. Active session role:{' '}
            <span className={`role-badge role-${user?.role}`}>{user?.role?.toUpperCase()}</span>
          </p>
        </div>

        <div className="page-actions">
          <PermissionGuard permission="create:content">
            <Link to="/content" className="btn-primary">
              <FileText size={16} />
              <span>Create New Content</span>
            </Link>
          </PermissionGuard>

          <PermissionGuard permission="manage:users">
            <Link to="/users" className="btn-secondary">
              <Users size={16} />
              <span>Manage Users</span>
            </Link>
          </PermissionGuard>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon-box bg-indigo">
            <Shield size={22} />
          </div>
          <div className="metric-content">
            <span className="metric-label">Session Role</span>
            <span className="metric-value">{user?.role?.toUpperCase()}</span>
            <span className="metric-sub">{user?.permissions.length} active permissions granted</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box bg-emerald">
            <Key size={22} />
          </div>
          <div className="metric-content">
            <span className="metric-label">JWT Token TTL</span>
            <span className="metric-value">{ttl}</span>
            <span className="metric-sub">Algorithm: HS256 (60m Window)</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box bg-blue">
            <FileText size={22} />
          </div>
          <div className="metric-content">
            <span className="metric-label">Accessible Modules</span>
            <span className="metric-value">
              {user?.role === 'admin' ? '4 / 4' : user?.role === 'editor' ? '2 / 4' : '1 / 4'}
            </span>
            <span className="metric-sub">Filtered by RBAC route guards</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box bg-amber">
            <Activity size={22} />
          </div>
          <div className="metric-content">
            <span className="metric-label">Token Status</span>
            <span className="metric-value text-emerald">VALID</span>
            <span className="metric-sub">Client side signature verified</span>
          </div>
        </div>
      </div>

      {/* Active Session & Privilege Details */}
      <div className="dashboard-grid-2col">
        {/* Token Details Panel */}
        <div className="panel-card">
          <div className="panel-header">
            <h3>Active JWT Claims & Token Payload</h3>
            <span className="pill-tag">RFC 7519</span>
          </div>
          <div className="panel-body">
            <div className="kv-list">
              <div className="kv-row">
                <span className="kv-key">Subject (sub):</span>
                <code className="kv-val">{decodedToken?.payload?.sub || user?.id}</code>
              </div>
              <div className="kv-row">
                <span className="kv-key">User Email:</span>
                <code className="kv-val">{user?.email}</code>
              </div>
              <div className="kv-row">
                <span className="kv-key">Role Claim:</span>
                <span className={`role-badge role-${user?.role}`}>{user?.role?.toUpperCase()}</span>
              </div>
              <div className="kv-row">
                <span className="kv-key">Issuer (iss):</span>
                <code className="kv-val">{decodedToken?.payload?.iss || 'rbac-auth-portal-v1'}</code>
              </div>
              <div className="kv-row">
                <span className="kv-key">Authorization Header:</span>
                <code className="kv-val text-truncate">Bearer {decodedToken?.rawToken?.substring(0, 30)}...</code>
              </div>
            </div>

            <div className="info-callout">
              <ShieldAlert size={16} />
              <span>
                Stateless session handling ensures the server validates requests using signature verification without database lookups.
              </span>
            </div>
          </div>
        </div>

        {/* Permissions Quick Check */}
        <div className="panel-card">
          <div className="panel-header">
            <h3>Active Role Permissions Matrix</h3>
            <span className="pill-tag">{user?.role?.toUpperCase()} PERMISSIONS</span>
          </div>
          <div className="panel-body">
            <div className="permission-list">
              {permissionsList.map((p) => {
                const granted = hasPermission(p.key as any);
                return (
                  <div key={p.key} className={`perm-item ${granted ? 'granted' : 'denied'}`}>
                    <div className="perm-left">
                      {granted ? <Check size={16} className="text-emerald" /> : <X size={16} className="text-danger" />}
                      <span className="perm-name">{p.label}</span>
                    </div>
                    <code className="perm-code">{p.key}</code>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* RBAC Reference Matrix */}
      <div className="panel-card margin-top">
        <div className="panel-header">
          <h3>Full Enterprise Role-Based Access Control (RBAC) Comparison Matrix</h3>
        </div>
        <div className="panel-body table-responsive">
          <table className="rbac-matrix-table">
            <thead>
              <tr>
                <th>Feature / Permission</th>
                <th>Permission Claim</th>
                <th>
                  <span className="role-badge role-admin">ADMIN</span>
                </th>
                <th>
                  <span className="role-badge role-editor">EDITOR</span>
                </th>
                <th>
                  <span className="role-badge role-viewer">VIEWER</span>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>View Dashboard & Read Articles</td>
                <td><code>read:all</code></td>
                <td><Check size={18} className="text-emerald" /></td>
                <td><Check size={18} className="text-emerald" /></td>
                <td><Check size={18} className="text-emerald" /></td>
              </tr>
              <tr>
                <td>Create New Content & Drafts</td>
                <td><code>create:content</code></td>
                <td><Check size={18} className="text-emerald" /></td>
                <td><Check size={18} className="text-emerald" /></td>
                <td><X size={18} className="text-muted" /></td>
              </tr>
              <tr>
                <td>Edit & Update Existing Content</td>
                <td><code>edit:content</code></td>
                <td><Check size={18} className="text-emerald" /></td>
                <td><Check size={18} className="text-emerald" /></td>
                <td><X size={18} className="text-muted" /></td>
              </tr>
              <tr>
                <td>Publish Draft Content</td>
                <td><code>publish:content</code></td>
                <td><Check size={18} className="text-emerald" /></td>
                <td><Check size={18} className="text-emerald" /></td>
                <td><X size={18} className="text-muted" /></td>
              </tr>
              <tr>
                <td>Delete Content & Records</td>
                <td><code>delete:content</code></td>
                <td><Check size={18} className="text-emerald" /></td>
                <td><X size={18} className="text-muted" /></td>
                <td><X size={18} className="text-muted" /></td>
              </tr>
              <tr>
                <td>User Role & Account Management</td>
                <td><code>manage:users</code></td>
                <td><Check size={18} className="text-emerald" /></td>
                <td><X size={18} className="text-muted" /></td>
                <td><X size={18} className="text-muted" /></td>
              </tr>
              <tr>
                <td>Security & Access Audit Logs</td>
                <td><code>audit:logs</code></td>
                <td><Check size={18} className="text-emerald" /></td>
                <td><X size={18} className="text-muted" /></td>
                <td><X size={18} className="text-muted" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
