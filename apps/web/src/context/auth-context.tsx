'use client';

/**
 * YuukiList — Provedor de Estado de Autenticação no Cliente
 * Conforme Requisito: Route Protection and Client Session Context
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import type {
  RegisterDto,
  LoginDto,
  AuthUserResponse,
} from '../../../../packages/shared/src/index.ts';
import { AuthApiClient, AuthApiError } from '../services/auth-api.client.ts';

export interface AuthContextValue {
  user: AuthUserResponse | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  register: (dto: RegisterDto) => Promise<AuthUserResponse>;
  login: (dto: LoginDto) => Promise<AuthUserResponse>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<AuthUserResponse | null>;
  syncUserProfile: (patch: Partial<AuthUserResponse>) => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export interface AuthProviderProps {
  children: ReactNode;
  client?: AuthApiClient;
}

export function AuthProvider({ children, client }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUserResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const apiClient = useMemo(() => client || new AuthApiClient(), [client]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Carrega sessão existente na montagem inicial
  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      try {
        const currentUser = await apiClient.getMe();
        if (isMounted) {
          setUser(currentUser);
        }
      } catch {
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadSession();

    return () => {
      isMounted = false;
    };
  }, [apiClient]);

  const register = useCallback(
    async (dto: RegisterDto): Promise<AuthUserResponse> => {
      setError(null);
      try {
        const newUser = await apiClient.register(dto);
        setUser(newUser);
        return newUser;
      } catch (err: any) {
        const message = err.message || 'Erro ao criar conta';
        setError(message);
        throw err;
      }
    },
    [apiClient]
  );

  const login = useCallback(
    async (dto: LoginDto): Promise<AuthUserResponse> => {
      setError(null);
      try {
        const loggedUser = await apiClient.login(dto);
        setUser(loggedUser);
        return loggedUser;
      } catch (err: any) {
        const message = err.message || 'Identificador ou senha inválidos';
        setError(message);
        throw err;
      }
    },
    [apiClient]
  );

  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      await apiClient.logout();
    } catch {
      // Ignora erro de rede para assegurar limpeza local
    } finally {
      setUser(null);
      setIsLoading(false);
    }
  }, [apiClient]);

  const refreshUser = useCallback(async (): Promise<AuthUserResponse | null> => {
    try {
      const freshUser = await apiClient.getMe();
      setUser(freshUser);
      return freshUser;
    } catch {
      return null;
    }
  }, [apiClient]);

  const syncUserProfile = useCallback((patch: Partial<AuthUserResponse>) => {
    setUser((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      error,
      isAuthenticated: user !== null,
      register,
      login,
      logout,
      refreshUser,
      syncUserProfile,
      clearError,
    }),
    [user, isLoading, error, register, login, logout, refreshUser, syncUserProfile, clearError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um <AuthProvider>');
  }
  return context;
}

