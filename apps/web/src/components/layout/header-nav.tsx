'use client';

/**
 * YuukiList — Navegação do Cabeçalho com Estado de Autenticação
 * Conforme Requisito: Route Protection and Client Session Context
 */

import React from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../context/auth-context.tsx';

export function HeaderNav() {
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  const isLoginActive = pathname === '/login';
  const isRegisterActive = pathname === '/register';
  const isLibraryActive = pathname === '/library';

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <nav role="navigation" aria-label="Navegação Principal" className="flex items-center gap-4 sm:gap-6">
      <a
        href="/"
        className={`text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-[#06B6D4] rounded px-2 py-1 ${
          pathname === '/' ? 'text-[#06B6D4] font-semibold' : 'text-[#F3F4F6] hover:text-[#06B6D4]'
        }`}
      >
        Catálogo
      </a>

      {isAuthenticated && (
        <a
          href="/library"
          className={`text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-[#06B6D4] rounded px-2 py-1 ${
            isLibraryActive ? 'text-[#06B6D4] font-semibold' : 'text-[#F3F4F6] hover:text-[#06B6D4]'
          }`}
        >
          Minha Biblioteca
        </a>
      )}

      {isLoading ? (
        <div className="w-20 h-8 rounded-lg bg-[#181C2B] animate-pulse" />
      ) : isAuthenticated && user ? (
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#94A3B8] hidden sm:inline">
            Olá, <strong className="text-white font-medium">{user.username}</strong>
          </span>
          <button
            onClick={handleLogout}
            className="text-xs px-3 py-1.5 rounded-lg bg-[#181C2B] hover:bg-[#262C3F] text-[#F3F4F6] border border-[#262C3F] transition-colors focus-visible:ring-2 focus-visible:ring-[#06B6D4]"
          >
            Sair
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <a
            href="/login"
            className={`text-xs px-3 py-1.5 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-[#06B6D4] ${
              isLoginActive
                ? 'bg-[#06B6D4] text-black font-semibold'
                : 'text-[#F3F4F6] hover:text-[#06B6D4]'
            }`}
          >
            Entrar
          </a>
          <a
            href="/register"
            className={`text-xs px-3.5 py-1.5 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-[#06B6D4] ${
              isRegisterActive
                ? 'bg-[#06B6D4] text-black font-semibold'
                : isLoginActive
                ? 'text-[#F3F4F6] hover:text-[#06B6D4]'
                : 'bg-[#06B6D4] hover:bg-[#22D3EE] text-black font-semibold'
            }`}
          >
            Criar Conta
          </a>
        </div>
      )}
    </nav>
  );
}
