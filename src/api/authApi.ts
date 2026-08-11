import { AuditLog, ContentItem, User } from '../types';
import { createJwtToken, decodeJwtToken } from '../services/jwtService';

export interface MockUserRecord extends Omit<User, 'status'> {
  status: 'active' | 'inactive';
  passwordHash: string;
}

// Mock Users Database
export const MOCK_USERS: MockUserRecord[] = [
  {
    id: 'usr_admin_01',
    email: 'admin@system.io',
    name: 'Eleanor Vance',
    role: 'admin',
    title: 'Lead Security Administrator',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    status: 'active',
    passwordHash: 'Admin@123',
    permissions: [
      'read:all',
      'create:content',
      'edit:content',
      'delete:content',
      'publish:content',
      'manage:users',
      'view:analytics',
      'manage:settings',
      'audit:logs',
    ],
  },
  {
    id: 'usr_editor_02',
    email: 'editor@system.io',
    name: 'Marcus Holloway',
    role: 'editor',
    title: 'Senior Technical Editor',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    status: 'active',
    passwordHash: 'Editor@123',
    permissions: [
      'read:all',
      'create:content',
      'edit:content',
      'publish:content',
      'view:analytics',
    ],
  },
  {
    id: 'usr_viewer_03',
    email: 'viewer@system.io',
    name: 'Sophia Chen',
    role: 'viewer',
    title: 'Product Auditor & Analyst',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    status: 'active',
    passwordHash: 'Viewer@123',
    permissions: ['read:all'],
  },
];

// Mock Content Database
export let INITIAL_CONTENT_ITEMS: ContentItem[] = [
  {
    id: 'cnt_001',
    title: 'Zero-Trust Architecture Guidelines for Microservices',
    summary: 'Best practices for implementing mTLS, JWT verification, and service mesh authorization.',
    content: 'Implementing Zero-Trust requires verifying identity explicitly on every request. JWT tokens serve as signed claims that services validate statelessly.',
    author: 'Eleanor Vance',
    authorRole: 'admin',
    status: 'published',
    category: 'Security Architecture',
    createdAt: '2026-08-01T10:00:00Z',
    updatedAt: '2026-08-10T14:20:00Z',
  },
  {
    id: 'cnt_002',
    title: 'Role-Based Access Control (RBAC) vs Attribute-Based Access Control (ABAC)',
    summary: 'A deep dive into permission strategies for scale enterprise web applications.',
    content: 'RBAC assigns static roles to users, whereas ABAC evaluates runtime attributes like user location, time of day, and resource ownership.',
    author: 'Marcus Holloway',
    authorRole: 'editor',
    status: 'published',
    category: 'Authorization',
    createdAt: '2026-08-05T11:30:00Z',
    updatedAt: '2026-08-09T09:15:00Z',
  },
  {
    id: 'cnt_003',
    title: 'Securing OAuth2 Refresh Token Rotation in Single Page Applications',
    summary: 'Preventing XSS and token replay attacks when storing authentication state.',
    content: 'Storing JWTs in HTTP-Only cookies mitigates XSS risk, while in-memory storage combined with short-lived tokens minimizes persistent theft exposure.',
    author: 'Marcus Holloway',
    authorRole: 'editor',
    status: 'draft',
    category: 'OAuth2 & Web Security',
    createdAt: '2026-08-08T16:45:00Z',
    updatedAt: '2026-08-11T08:00:00Z',
  },
];

// Mock Audit Logs Database
export let INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log_101',
    timestamp: '2026-08-11T08:30:15Z',
    userId: 'usr_admin_01',
    userName: 'Eleanor Vance',
    userRole: 'admin',
    action: 'USER_LOGIN_SUCCESS',
    target: 'Auth Service',
    status: 'success',
    details: 'JWT token issued (HS256 signature algorithm, 60m TTL)',
    ipAddress: '192.168.1.45',
  },
  {
    id: 'log_102',
    timestamp: '2026-08-11T08:45:22Z',
    userId: 'usr_editor_02',
    userName: 'Marcus Holloway',
    userRole: 'editor',
    action: 'CONTENT_UPDATE',
    target: 'cnt_003',
    status: 'success',
    details: 'Updated article draft summary and tags',
    ipAddress: '192.168.1.88',
  },
  {
    id: 'log_103',
    timestamp: '2026-08-11T09:02:10Z',
    userId: 'usr_viewer_03',
    userName: 'Sophia Chen',
    userRole: 'viewer',
    action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
    target: '/users',
    status: 'denied',
    details: 'Role "viewer" blocked from accessing User Management module (requires permission "manage:users")',
    ipAddress: '192.168.1.102',
  },
];

/**
 * Simulate authentication login endpoint
 */
export async function loginApi(email: string, pass: string): Promise<{ token: string; user: User }> {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 450));

  const foundUser = MOCK_USERS.find(
    (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.passwordHash === pass
  );

  if (!foundUser) {
    throw new Error('Invalid email address or password.');
  }

  if (foundUser.status === 'inactive') {
    throw new Error('This account has been deactivated by an administrator.');
  }

  const { passwordHash, ...userProfile } = foundUser;
  const token = createJwtToken(userProfile, 60); // 60-minute JWT token

  // Log audit event
  const newLog: AuditLog = {
    id: `log_${Date.now()}`,
    timestamp: new Date().toISOString(),
    userId: userProfile.id,
    userName: userProfile.name,
    userRole: userProfile.role,
    action: 'USER_LOGIN_SUCCESS',
    target: 'Auth Endpoint /api/v1/auth/login',
    status: 'success',
    details: `Generated JWT token for ${userProfile.email} with role [${userProfile.role.toUpperCase()}]`,
    ipAddress: '127.0.0.1 (Localhost)',
  };
  INITIAL_AUDIT_LOGS.unshift(newLog);

  return { token, user: userProfile };
}

/**
 * Fetch profile by validating JWT token
 */
export async function validateTokenApi(token: string): Promise<User> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const decoded = decodeJwtToken(token);
  if (!decoded) {
    throw new Error('Malformed or unparseable JWT token format.');
  }

  if (decoded.isExpired) {
    throw new Error('JWT token has expired. Please log in again.');
  }

  if (!decoded.isValid) {
    throw new Error('JWT token signature verification failed (tampered token).');
  }

  const foundUser = MOCK_USERS.find((u) => u.id === decoded.payload.sub);
  if (!foundUser) {
    throw new Error('User associated with JWT token no longer exists.');
  }

  const { passwordHash, ...userProfile } = foundUser;
  return userProfile;
}

/**
 * Add an audit log entry programmatically
 */
export function addAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>) {
  const newLog: AuditLog = {
    ...log,
    id: `log_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
  };
  INITIAL_AUDIT_LOGS.unshift(newLog);
}
