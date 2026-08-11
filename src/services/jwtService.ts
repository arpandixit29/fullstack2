import { DecodedJwtToken, JwtHeader, JwtPayload, User } from '../types';

const MOCK_SECRET_KEY = 'rbac-secure-jwt-secret-key-2026';

/**
 * Base64URL Encoding helper (RFC 7515 standard)
 */
function base64UrlEncode(str: string): string {
  const base64 = btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) =>
      String.fromCharCode(parseInt(p1, 16))
    )
  );
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Base64URL Decoding helper
 */
function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4 !== 0) {
    base64 += '=';
  }
  const decoded = atob(base64);
  return decodeURIComponent(
    decoded
      .split('')
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
}

/**
 * Simple pseudo-HMAC-SHA256 signature generator for simulation
 */
function generateMockSignature(headerB64: string, payloadB64: string, secret: string): string {
  const content = `${headerB64}.${payloadB64}.${secret}`;
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32-bit integer
  }
  // Convert hash to a 32-character hexadecimal string
  const absHash = Math.abs(hash).toString(16).padStart(8, '0');
  const signatureStr = `sig_${absHash}_${btoa(secret).substring(0, 10)}`;
  return base64UrlEncode(signatureStr);
}

/**
 * Create a spec-compliant JWT token for a given user
 */
export function createJwtToken(user: User, expiresInMinutes = 60): string {
  const header: JwtHeader = {
    alg: 'HS256',
    typ: 'JWT',
  };

  const nowInSeconds = Math.floor(Date.now() / 1000);
  const payload: JwtPayload = {
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    permissions: user.permissions,
    iat: nowInSeconds,
    exp: nowInSeconds + expiresInMinutes * 60,
    iss: 'rbac-auth-portal-v1',
  };

  const headerB64 = base64UrlEncode(JSON.stringify(header));
  const payloadB64 = base64UrlEncode(JSON.stringify(payload));
  const signatureB64 = generateMockSignature(headerB64, payloadB64, MOCK_SECRET_KEY);

  return `${headerB64}.${payloadB64}.${signatureB64}`;
}

/**
 * Safely parse and decode a JWT token string without verification
 */
export function decodeJwtToken(token: string): DecodedJwtToken | null {
  if (!token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 3) return null;

  try {
    const [headerB64, payloadB64, signatureB64] = parts;
    const headerStr = base64UrlDecode(headerB64);
    const payloadStr = base64UrlDecode(payloadB64);

    const header: JwtHeader = JSON.parse(headerStr);
    const payload: JwtPayload = JSON.parse(payloadStr);

    const nowInSeconds = Math.floor(Date.now() / 1000);
    const isExpired = payload.exp ? payload.exp < nowInSeconds : false;

    // Verify signature
    const expectedSignature = generateMockSignature(headerB64, payloadB64, MOCK_SECRET_KEY);
    const isValid = signatureB64 === expectedSignature && !isExpired;

    return {
      header,
      payload,
      signature: signatureB64,
      rawToken: token,
      isExpired,
      isValid,
    };
  } catch (err) {
    console.error('Failed to parse JWT token:', err);
    return null;
  }
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
  const decoded = decodeJwtToken(token);
  if (!decoded) return true;
  return decoded.isExpired;
}

/**
 * Format remaining TTL in minutes and seconds
 */
export function getRemainingTtl(expTimestamp: number): { minutes: number; seconds: number; text: string } {
  const nowInSeconds = Math.floor(Date.now() / 1000);
  const diff = expTimestamp - nowInSeconds;
  if (diff <= 0) {
    return { minutes: 0, seconds: 0, text: 'Expired' };
  }
  const minutes = Math.floor(diff / 60);
  const seconds = diff % 60;
  const text = `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
  return { minutes, seconds, text };
}
