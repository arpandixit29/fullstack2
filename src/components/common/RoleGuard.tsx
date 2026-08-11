import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../types';

interface RoleGuardProps {
  allowedRoles: Role[];
  children?: React.ReactNode;
  fallback?: React.ReactNode;
  redirect?: boolean;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  allowedRoles,
  children,
  fallback,
  redirect = true,
}) => {
  const { hasRole, user } = useAuth();

  const isAuthorized = hasRole(allowedRoles);

  if (!isAuthorized) {
    if (redirect && !children) {
      return <Navigate to="/unauthorized" replace />;
    }

    if (fallback) {
      return <>{fallback}</>;
    }

    return null;
  }

  return children ? <>{children}</> : <Outlet />;
};
