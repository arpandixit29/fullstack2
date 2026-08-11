import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Permission } from '../../types';

interface PermissionGuardProps {
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permission,
  permissions = [],
  requireAll = false,
  children,
  fallback = null,
}) => {
  const { hasPermission } = useAuth();

  const requiredList = permission ? [permission, ...permissions] : permissions;

  if (requiredList.length === 0) {
    return <>{children}</>;
  }

  const isAuthorized = requireAll
    ? requiredList.every((p) => hasPermission(p))
    : requiredList.some((p) => hasPermission(p));

  if (!isAuthorized) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
