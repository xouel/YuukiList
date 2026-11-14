/**
 * YuukiList — Cliente HTTP Tipado de Autenticação
 * Conforme Requisito: Route Protection and Client Session Context
 */

import type {
  RegisterDto,
  LoginDto,
  AuthUserResponse,
  ForgotPasswordDto,
  ResetPasswordDto,
  AuthConflictField,
} from '../../../../packages/shared/src/index.ts';

export class AuthApiError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly serverCode?: string;
  readonly field?: AuthConflictField;

  constructor(
    message: string,
    statusCode = 500,
    code = 'NETWORK_ERROR',
    options?: { serverCode?: string; field?: AuthConflictField }
  ) {
    super(message);
    this.name = 'AuthApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.serverCode = options?.serverCode;
    this.field = options?.field;
  }
}

export type FetchFunction = (input: string | URL, init?: RequestInit) => Promise<Response>;

export interface AuthApiClientOptions {
  baseUrl?: string;
  fetcher?: FetchFunction;
}

export class AuthApiClient {
  private readonly baseUrl: string;
  private readonly fetcher: FetchFunction;

  constructor(options: AuthApiClientOptions = {}) {
    this.baseUrl = options.baseUrl ? options.baseUrl.replace(/\/+$/, '') : '';
    this.fetcher = options.fetcher || ((input, init) => globalThis.fetch(input, init));
  }

  async register(dto: RegisterDto): Promise<AuthUserResponse> {
    try {
      const response = await this.fetcher(`${this.baseUrl}/api/v1/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(dto),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message =
          errorData.message ||
          (response.status === 409
            ? 'Email ou nome de usuário já em uso'
            : 'Erro ao criar conta');
        const code = response.status === 409 ? 'CONFLICT' : 'VALIDATION_ERROR';
        throw new AuthApiError(message, response.status, code, {
          serverCode: errorData.code,
          field: errorData.field,
        });
      }

      const data = await response.json();
      return data.user || data;
    } catch (err: any) {
      if (err instanceof AuthApiError) throw err;
      throw new AuthApiError(
        err.message || 'Falha de comunicação com o servidor de autenticação',
        0,
        'NETWORK_ERROR'
      );
    }
  }

  async login(dto: LoginDto): Promise<AuthUserResponse> {
    try {
      const response = await this.fetcher(`${this.baseUrl}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(dto),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message =
          errorData.message ||
          (response.status === 401
            ? 'Usuário/e-mail ou senha incorretos'
            : 'Erro ao autenticar');
        const code =
          response.status === 401
            ? 'INVALID_CREDENTIALS'
            : response.status >= 500
              ? 'INTERNAL_ERROR'
              : 'API_ERROR';
        throw new AuthApiError(message, response.status, code, {
          serverCode: errorData.code,
        });
      }

      const data = await response.json();
      return data.user || data;
    } catch (err: any) {
      if (err instanceof AuthApiError) throw err;
      throw new AuthApiError(
        err.message || 'Falha de comunicação com o servidor de autenticação',
        0,
        'NETWORK_ERROR'
      );
    }
  }

  async logout(): Promise<{ success: boolean }> {
    try {
      const response = await this.fetcher(`${this.baseUrl}/api/v1/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new AuthApiError('Falha ao encerrar sessão', response.status, 'LOGOUT_ERROR');
      }

      // Expurgo mandatório de caches privados no logout (TR-012)
      if (typeof window !== 'undefined') {
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage('PURGE_PRIVATE_CACHE');
        }
        if ('caches' in window) {
          caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k)))).catch(() => {});
        }
      }

      return { success: true };
    } catch (err: any) {
      if (err instanceof AuthApiError) throw err;
      throw new AuthApiError(
        err.message || 'Falha de comunicação com o servidor de autenticação',
        0,
        'NETWORK_ERROR'
      );
    }
  }

  async getMe(): Promise<AuthUserResponse | null> {
    try {
      const response = await this.fetcher(`${this.baseUrl}/api/v1/auth/me`, {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
      });

      if (response.status === 401) {
        return null;
      }

      if (!response.ok) {
        throw new AuthApiError('Erro ao consultar sessão', response.status, 'AUTH_ERROR');
      }

      const data = await response.json();
      return data;
    } catch (err: any) {
      if (err instanceof AuthApiError && err.statusCode === 401) {
        return null;
      }
      return null;
    }
  }

  async requestPasswordReset(dto: ForgotPasswordDto): Promise<{ message: string }> {
    try {
      const response = await this.fetcher(`${this.baseUrl}/api/v1/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dto),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new AuthApiError(
          data.message || 'Falha ao solicitar recuperação de senha',
          response.status,
          data.code || 'API_ERROR'
        );
      }
      return data;
    } catch (err: any) {
      if (err instanceof AuthApiError) throw err;
      throw new AuthApiError(
        err.message || 'Falha de comunicação ao solicitar recuperação de senha',
        0,
        'NETWORK_ERROR'
      );
    }
  }

  async validateResetToken(token: string): Promise<{ valid: boolean }> {
    try {
      const response = await this.fetcher(
        `${this.baseUrl}/api/v1/auth/reset-password?token=${encodeURIComponent(token)}`,
        {
          method: 'GET',
          cache: 'no-store',
        }
      );

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new AuthApiError(
          data.message || 'Link de redefinição inválido ou expirado',
          response.status,
          data.code || 'RESET_TOKEN_INVALID'
        );
      }
      return data;
    } catch (err: any) {
      if (err instanceof AuthApiError) throw err;
      throw new AuthApiError(
        err.message || 'Falha ao validar token de redefinição',
        0,
        'NETWORK_ERROR'
      );
    }
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    try {
      const response = await this.fetcher(`${this.baseUrl}/api/v1/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dto),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new AuthApiError(
          data.message || 'Falha ao redefinir senha',
          response.status,
          data.code || 'RESET_TOKEN_INVALID'
        );
      }
      return data;
    } catch (err: any) {
      if (err instanceof AuthApiError) throw err;
      throw new AuthApiError(
        err.message || 'Falha de comunicação ao redefinir senha',
        0,
        'NETWORK_ERROR'
      );
    }
  }
}

export const authApiClient = new AuthApiClient();

