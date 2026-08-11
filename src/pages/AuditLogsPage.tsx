import React, { useState } from 'react';
import { INITIAL_AUDIT_LOGS } from '../api/authApi';
import { AuditLog } from '../types';
import { ShieldCheck, ShieldAlert, AlertTriangle, Search, Filter, Terminal } from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
  const [logs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.target.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Security & Audit Event Trail</h1>
          <p className="page-subtitle">
            <span className="badge-admin">ADMIN ONLY</span> Immutable security logs of authentication, JWT tokens, and authorization checks
          </p>
        </div>

        <div className="page-actions">
          <div className="admin-status-pill">
            <Terminal size={16} />
            <span>Audit Trail Active</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="filter-bar">
        <div className="search-input-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search audit logs by action, user, target, or details..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="select-box">
          <Filter size={16} />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Audit Statuses</option>
            <option value="success">Success Only</option>
            <option value="denied">Denied / Blocked Only</option>
            <option value="warning">Warning Only</option>
          </select>
        </div>
      </div>

      {/* Audit Table */}
      <div className="panel-card">
        <div className="panel-header">
          <h3>System Event History ({filteredLogs.length})</h3>
        </div>
        <div className="panel-body table-responsive">
          <table className="data-table audit-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>User / Subject</th>
                <th>Action Event</th>
                <th>Target Resource</th>
                <th>Status</th>
                <th>Event Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id}>
                  <td>
                    <span className="log-time">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    <span className="log-date">{new Date(log.timestamp).toLocaleDateString()}</span>
                  </td>
                  <td>
                    <div className="table-user-cell">
                      <div>
                        <span className="table-user-name">{log.userName}</span>
                        <span className={`role-badge-sm role-${log.userRole}`}>{log.userRole.toUpperCase()}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <code className="action-code">{log.action}</code>
                  </td>
                  <td>
                    <span className="target-pill">{log.target}</span>
                  </td>
                  <td>
                    {log.status === 'success' && (
                      <span className="log-badge badge-success">
                        <ShieldCheck size={13} />
                        SUCCESS
                      </span>
                    )}
                    {log.status === 'denied' && (
                      <span className="log-badge badge-danger">
                        <ShieldAlert size={13} />
                        DENIED
                      </span>
                    )}
                    {log.status === 'warning' && (
                      <span className="log-badge badge-warning">
                        <AlertTriangle size={13} />
                        WARNING
                      </span>
                    )}
                  </td>
                  <td>
                    <span className="log-details">{log.details}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
