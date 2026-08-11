import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { AuthContextType, DecodedJwtToken, Permission, Role, User } from '../types';
import { createJwtToken, decodeJwtToken } from '../services/jwtService';
import { addAuditLog, loginApi } from '../api/authApi';

const TOKEN_KEY = 'rbac_jwt_access_token';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<User | null>(null);
  const [decodedToken, setDecodedToken] = useState<DecodedJwtToken | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize and validate session from stored JWT
  const initializeAuth = useCallback(() => {
    setIsLoading(true);
    const storedToken = localStorage.getItem(TOKEN_KEY);

    if (!storedToken) {
      setToken(null);
      setUser(null);
      setDecodedToken(null);
      setIsLoading(false);
      return;
    }

    const decoded = decodeJwtToken(storedToken);

    if (decoded && decoded.isValid && !decoded.isExpired) {
      setToken(storedToken);
      setDecodedToken(decoded);
      setUser({
        id: decoded.payload.sub,
        email: decoded.payload.email,
        name: decoded.payload.name,
        role: decoded.payload.role,
        permissions: decoded.payload.permissions,
        status: 'active',
      });
    } else {
      // Token expired or invalid
      console.warn('Stored JWT token is invalid or expired. Purging auth state.');
      localStorage.removeItem(TOKEN_KEY);
      setToken(null);
      setUser(null);
      setDecodedToken(null);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Periodic expiration checker (every 10 seconds)
  useEffect(() => {
    if (!token) return;

    const interval = setInterval(() => {
      const decoded = decodeJwtToken(token);
      if (!decoded || decoded.isExpired || !decoded.isValid) {
        console.warn('JWT Token expired or invalidated during session.');
        logout('Session expired (JWT TTL elapsed)');
      } else {
        setDecodedToken(decoded);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [token]);

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      const res = await loginApi(email, pass);
      localStorage.setItem(TOKEN_KEY, res.token);
      setToken(res.token);
      setUser(res.user);
      
      const decoded = decodeJwtToken(res.token);
      setDecodedToken(decoded);

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Authentication failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = useCallback((reason = 'User initiated logout') => {
    if (user) {
      addAuditLog({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        action: 'USER_LOGOUT',
        target: 'Auth Service',
        status: 'success',
        details: `Session terminated. Reason: ${reason}`,
        ipAddress: '127.0.0.1 (Localhost)',
      });
    }

    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    setDecodedToken(null);
  }, [user]);

  const hasPermission = useCallback((permission: Permission): boolean => {
    if (!user || !user.permissions) return false;
    return user.permissions.includes(permission);
  }, [user]);

  const hasRole = useCallback((roles: Role | Role[]): boolean => {
    if (!user) return false;
    const roleList = Array.isArray(roles) ? roles : [roles];
    return roleList.includes(user.role);
  }, [user]);

  const refreshToken = async (): Promise<void> => {
    if (!user) return;
    const newToken = createJwtToken(user, 60);
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
    const decoded = decodeJwtToken(newToken);
    setDecodedToken(decoded);

    addAuditLog({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'TOKEN_REFRESH',
      target: 'JWT Service',
      status: 'success',
      details: 'JWT access token renewed for 60 minutes',
      ipAddress: '127.0.0.1 (Localhost)',
    });
  };

  // Demo tool: purposely tamper with the raw token to demonstrate JWT signature failure
  const tamperToken = (): void => {
    if (!token) return;
    const parts = token.split('.');
    if (parts.length !== 3) return;

    // Mutate signature part
    const corruptedSignature = 'TAMPERED_INVALID_SIG_99999';
    const tampered = `${parts[0]}.${parts[1]}.${corruptedSignature}`;
    
    localStorage.setItem(TOKEN_KEY, tampered);
    setToken(tampered);

    const decoded = decodeJwtToken(tampered);
    setDecodedToken(decoded);

    if (user) {
      addAuditLog({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        action: 'SECURITY_TOKEN_TAMPERED',
        target: 'JWT Signature Verifier',
        status: 'denied',
        details: 'Client-side JWT token signature corruption detected. System marked token invalid.',
        ipAddress: '127.0.0.1 (Localhost)',
      });
    }
  };

  const value: AuthContextType = {
    user,
    token,
    decodedToken,
    isAuthenticated: !!token && !!user && (decodedToken?.isValid ?? false),
    isLoading,
    login,
    logout,
    hasPermission,
    hasRole,
    refreshToken,
    tamperToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
