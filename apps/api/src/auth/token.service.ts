import crypto from 'node:crypto';
import {
  AUTH_COOKIE_NAME,
  AUTH_COOKIE_MAX_AGE_SECONDS,
  type SessionPayload,
} from '../../../../packages/shared/src/index.ts';

function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString('utf8');
}

const DEV_FALLBACK_SECRET =
  'yuukilist_dev_super_secret_key_32_bytes_long_required_12345';

export class TokenService {
  private readonly explicitSecret?: string;

  constructor(secret?: string) {
    this.explicitSecret = secret;
  }

  private resolveSecret(): string {
    const configured = this.explicitSecret || process.env.JWT_SECRET;
    if (configured && configured.trim().length > 0) {
      return configured;
    }

    const isProduction =
      process.env.NODE_ENV === 'production' ||
      process.env.VERCEL_ENV === 'production';

    if (isProduction) {
      throw new Error(
        'JWT_SECRET é obrigatório em ambiente de produção (NODE_ENV=production ou VERCEL_ENV=production).'
      );
    }

    return DEV_FALLBACK_SECRET;
  }

  signSession(
    payload: Omit<SessionPayload, 'iat' | 'exp'>,
    expiresInSeconds: number = AUTH_COOKIE_MAX_AGE_SECONDS
  ): string {
    const secret = this.resolveSecret();
    const now = Math.floor(Date.now() / 1000);
    const fullPayload: SessionPayload = {
      ...payload,
      iat: now,
      exp: now + expiresInSeconds,
    };

    const header = { alg: 'HS256', typ: 'JWT' };
    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));

    const signature = crypto
      .createHmac('sha256', secret)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  verifySession(token: string): SessionPayload | null {
    const secret = this.resolveSecret();

    if (!token || typeof token !== 'string') {
      return null;
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const [encodedHeader, encodedPayload, signature] = parts;

    try {
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(`${encodedHeader}.${encodedPayload}`)
        .digest('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');

      const expectedBuf = Buffer.from(expectedSignature);
      const signatureBuf = Buffer.from(signature);

      if (expectedBuf.length !== signatureBuf.length) {
        return null;
      }

      if (!crypto.timingSafeEqual(expectedBuf, signatureBuf)) {
        return null;
      }

      const decodedJson = base64UrlDecode(encodedPayload);
      const payload = JSON.parse(decodedJson) as SessionPayload;

      const now = Math.floor(Date.now() / 1000);
      if (typeof payload.exp === 'number' && payload.exp < now) {
        return null; // Expirado
      }

      return payload;
    } catch {
      return null;
    }
  }

  createSessionCookie(
    token: string,
    maxAge: number = AUTH_COOKIE_MAX_AGE_SECONDS
  ): string {
    return `${AUTH_COOKIE_NAME}=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${maxAge}`;
  }

  createLogoutCookie(): string {
    return `${AUTH_COOKIE_NAME}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`;
  }

  extractToken(
    headers: Record<string, string | string[] | undefined>,
    cookies?: Record<string, string>
  ): string | null {
    // 1. Tentar ler do mapa de cookies parseados
    if (cookies && cookies[AUTH_COOKIE_NAME]) {
      return cookies[AUTH_COOKIE_NAME];
    }

    // 2. Tentar ler do cabeçalho 'cookie' raw
    const rawCookie = headers['cookie'] || headers['Cookie'];
    if (typeof rawCookie === 'string') {
      const match = rawCookie.match(new RegExp(`(?:^|;\\s*)${AUTH_COOKIE_NAME}=([^;]+)`));
      if (match && match[1]) {
        return decodeURIComponent(match[1]);
      }
    }

    // 3. Fallback: Tentar ler do cabeçalho 'authorization' (Bearer <token>)
    const authHeader = headers['authorization'] || headers['Authorization'];
    if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7).trim();
    }

    return null;
  }
}
