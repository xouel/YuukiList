'use client';

/**
 * YuukiList — Componente de Proteção de Rotas Privadas
 * Conforme Requisito: Route Protection and Client Session Context
 */

import React, { useEffect, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../../context/auth-context.tsx';

export interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const redirectPath = pathname ? `?redirect=${encodeURIComponent(pathname)}` : '';
      router.replace(`/login${redirectPath}`);
    }
  }, [isLoading, isAuthenticated, router, pathname]);

  if (isLoading) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center"
      >
        <div className="w-12 h-12 rounded-full border-2 border-stroke-subtle border-t-accent animate-spin mb-4" />
        <p className="text-sm text-[var(--color-text-secondary)]">Verificando sessão segura...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

