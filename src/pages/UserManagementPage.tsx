import React, { useState } from 'react';
import { MOCK_USERS, addAuditLog } from '../api/authApi';
import { useAuth } from '../context/AuthContext';
import { User, Role } from '../types';
import { Users, Shield, UserCheck, UserX, Settings, Edit2, X, Check, Search, ShieldAlert } from 'lucide-react';

export const UserManagementPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [userList, setUserList] = useState<User[]>(
    MOCK_USERS.map(({ passwordHash, ...u }) => u)
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role>('viewer');

  const openEditModal = (targetUser: User) => {
    setEditingUser(targetUser);
    setSelectedRole(targetUser.role);
  };

  const handleUpdateRole = () => {
    if (!editingUser) return;

    // Define permissions for each role
    let newPermissions = editingUser.permissions;
    if (selectedRole === 'admin') {
      newPermissions = [
        'read:all',
        'create:content',
        'edit:content',
        'delete:content',
        'publish:content',
        'manage:users',
        'view:analytics',
        'manage:settings',
        'audit:logs',
      ];
    } else if (selectedRole === 'editor') {
      newPermissions = ['read:all', 'create:content', 'edit:content', 'publish:content', 'view:analytics'];
    } else {
      newPermissions = ['read:all'];
    }

    const updated = userList.map((u) =>
      u.id === editingUser.id ? { ...u, role: selectedRole, permissions: newPermissions } : u
    );

    setUserList(updated);

    if (currentUser) {
      addAuditLog({
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        action: 'ADMIN_ROLE_CHANGE',
        target: editingUser.email,
        status: 'success',
        details: `Updated role of user ${editingUser.name} from [${editingUser.role.toUpperCase()}] to [${selectedRole.toUpperCase()}]`,
        ipAddress: '127.0.0.1 (Localhost)',
      });
    }

    setEditingUser(null);
  };

  const toggleUserStatus = (targetUser: User) => {
    const newStatus = targetUser.status === 'active' ? 'inactive' : 'active';
    const updated = userList.map((u) => (u.id === targetUser.id ? { ...u, status: newStatus } : u));
    setUserList(updated);

    if (currentUser) {
      addAuditLog({
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        action: 'ADMIN_USER_STATUS_TOGGLE',
        target: targetUser.email,
        status: 'success',
        details: `Changed account status of ${targetUser.name} to ${newStatus.toUpperCase()}`,
        ipAddress: '127.0.0.1 (Localhost)',
      });
    }
  };

  const filteredUsers = userList.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">User & Role Administration</h1>
          <p className="page-subtitle">
            <span className="badge-admin">ADMIN ONLY</span> Manage user access levels, RBAC role assignments, and account statuses
          </p>
        </div>

        <div className="page-actions">
          <div className="admin-status-pill">
            <Shield size={16} />
            <span>Admin Control Panel</span>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="filter-bar">
        <div className="search-input-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search users by name, email address, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="panel-card">
        <div className="panel-header">
          <h3>Registered System Accounts ({filteredUsers.length})</h3>
        </div>
        <div className="panel-body table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>User Details</th>
                <th>Assigned Role</th>
                <th>Permissions Count</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="table-user-cell">
                      {u.avatarUrl ? (
                        <img src={u.avatarUrl} alt={u.name} className="user-avatar-sm" />
                      ) : (
                        <div className="avatar-placeholder-sm">{u.name.charAt(0)}</div>
                      )}
                      <div>
                        <span className="table-user-name">{u.name}</span>
                        <span className="table-user-email">{u.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`role-badge role-${u.role}`}>{u.role.toUpperCase()}</span>
                  </td>
                  <td>
                    <span className="perm-counter-badge">{u.permissions.length} Granted</span>
                  </td>
                  <td>
                    <span className={`status-pill status-${u.status}`}>
                      {u.status === 'active' ? 'ACTIVE' : 'DEACTIVATED'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons-cell">
                      <button
                        className="btn-icon-sm"
                        onClick={() => openEditModal(u)}
                        title="Change User Role"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        className={`btn-icon-sm ${u.status === 'active' ? 'btn-danger-icon' : 'btn-success-icon'}`}
                        onClick={() => toggleUserStatus(u)}
                        title={u.status === 'active' ? 'Deactivate User' : 'Activate User'}
                        disabled={u.id === currentUser?.id}
                      >
                        {u.status === 'active' ? <UserX size={14} /> : <UserCheck size={14} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Assignment Modal */}
      {editingUser && (
        <div className="modal-backdrop" onClick={() => setEditingUser(null)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <Settings size={20} className="text-indigo" />
                <h3>Modify Role Assignment — {editingUser.name}</h3>
              </div>
              <button className="icon-btn-close" onClick={() => setEditingUser(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body form-stack">
              <p className="modal-desc">
                Changing a user's role updates their granted JWT claims upon their next login or token refresh.
              </p>

              <div className="form-group">
                <label>Select New Role:</label>
                <div className="role-selector-cards">
                  <button
                    type="button"
                    className={`role-select-card ${selectedRole === 'admin' ? 'selected' : ''}`}
                    onClick={() => setSelectedRole('admin')}
                  >
                    <span className="role-badge role-admin">ADMIN</span>
                    <p>Full privileges across all modules including users & audit logs.</p>
                  </button>

                  <button
                    type="button"
                    className={`role-select-card ${selectedRole === 'editor' ? 'selected' : ''}`}
                    onClick={() => setSelectedRole('editor')}
                  >
                    <span className="role-badge role-editor">EDITOR</span>
                    <p>Access to create, edit & publish articles. Restricted from admin.</p>
                  </button>

                  <button
                    type="button"
                    className={`role-select-card ${selectedRole === 'viewer' ? 'selected' : ''}`}
                    onClick={() => setSelectedRole('viewer')}
                  >
                    <span className="role-badge role-viewer">VIEWER</span>
                    <p>Read-only access to dashboard and content. No edit privileges.</p>
                  </button>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setEditingUser(null)}>
                  Cancel
                </button>
                <button type="button" className="btn-primary" onClick={handleUpdateRole}>
                  Update Role Assignment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
