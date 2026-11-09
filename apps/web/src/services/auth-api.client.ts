/**
 * YuukiList — Cliente HTTP Tipado de Autenticação
 * Conforme Requisito: Route Protection and Client Session Context
 */

import type {
  RegisterDto,
  LoginDto,
  AuthUserResponse,
} from '../../../../packages/shared/src/index.ts';

export class AuthApiError extends Error {
  readonly statusCode: number;
  readonly code: string;

  constructor(message: string, statusCode = 500, code = 'NETWORK_ERROR') {
    super(message);
    this.name = 'AuthApiError';
    this.statusCode = statusCode;
    this.code = code;
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
    this.fetcher = options.fetcher || globalThis.fetch;
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
        throw new AuthApiError(message, response.status, code);
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
            ? 'Identificador ou senha inválidos'
            : 'Erro ao autenticar');
        const code = response.status === 401 ? 'INVALID_CREDENTIALS' : 'API_ERROR';
        throw new AuthApiError(message, response.status, code);
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
}

