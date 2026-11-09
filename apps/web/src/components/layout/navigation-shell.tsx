'use client';

/**
 * YuukiList — Casca de Navegação Responsiva (Sidebar Desktop + Bottom Nav Mobile)
 * Conforme Seções 3.2, 3.3 e 11.1 do Documento Mestre de Contexto
 */

import React from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../context/auth-context.tsx';
import { ThemeToggle } from './theme-toggle.tsx';
import { LegalFooter } from './legal-footer.tsx';

interface NavigationShellProps {
  children: React.ReactNode;
}

export function NavigationShell({ children }: NavigationShellProps) {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();

  const navItems = [
    {
      name: 'Explorar',
      href: '/',
      isActive: pathname === '/',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
    {
      name: 'Buscar',
      href: '/?search=open',
      isActive: pathname === '/' && typeof window !== 'undefined' && window.location.search.includes('search'),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
    },
    {
      name: 'Biblioteca',
      href: '/library',
      isActive: pathname === '/library',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
      ),
    },
    {
      name: 'Calendário',
      href: '/calendar',
      isActive: pathname === '/calendar',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      name: 'Perfil',
      href: '/profile',
      isActive: pathname === '/profile',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
  ];

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#080A11] text-[#F3F4F6] transition-colors">
      {/* 1. TOP HEADER MOBILE (< 1024px) */}
      <header className="lg:hidden h-14 border-b border-[#1E2337] bg-[#0E111B]/90 backdrop-blur px-4 flex items-center justify-between sticky top-0 z-40">
        <a href="/" className="flex items-center gap-2">
          <span className="font-extrabold text-base tracking-wider bg-gradient-to-r from-[#06B6D4] to-[#8B5CF6] bg-clip-text text-transparent">
            YUUKILIST
          </span>
        </a>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="text-xs px-2.5 py-1 rounded bg-[#181C2B] text-[#94A3B8] border border-[#262C3F]"
            >
              Sair
            </button>
          ) : (
            <a
              href="/login"
              className="text-xs px-3 py-1 rounded bg-[#06B6D4] text-black font-semibold"
            >
              Entrar
            </a>
          )}
        </div>
      </header>

      {/* 2. SIDEBAR DESKTOP (>= 1024px) */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-[#1E2337] bg-[#0E111B] shrink-0 sticky top-0 h-screen z-30">
        {/* Logo / Marca */}
        <div className="p-6 border-b border-[#1E2337]">
          <a href="/" className="block">
            <span className="font-black text-xl tracking-wider bg-gradient-to-r from-[#06B6D4] via-[#38BDF8] to-[#8B5CF6] bg-clip-text text-transparent">
              YUUKILIST
            </span>
            <span className="block text-[11px] font-medium tracking-widest text-[#94A3B8] mt-0.5 uppercase">
              Catálogo Asiático
            </span>
          </a>
        </div>

        {/* Links Principais (5 Áreas) */}
        <nav role="navigation" aria-label="Navegação Desktop" className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                item.isActive
                  ? 'bg-gradient-to-r from-[#06B6D4]/15 to-[#8B5CF6]/15 text-[#06B6D4] font-semibold border border-[#06B6D4]/30 shadow-sm'
                  : 'text-[#94A3B8] hover:text-[#F3F4F6] hover:bg-[#181C2B]'
              }`}
            >
              {item.icon}
              <span>{item.name}</span>
            </a>
          ))}
        </nav>

        {/* Rodapé da Sidebar: Sessão do Usuário & ThemeToggle */}
        <div className="p-4 border-t border-[#1E2337] space-y-3 bg-[#0A0D16]">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#64748B]">Tema da Interface</span>
            <ThemeToggle />
          </div>

          {isAuthenticated && user ? (
            <div className="pt-2 border-t border-[#1E2337]/60 flex items-center justify-between">
              <a href="/profile" className="flex items-center gap-2.5 overflow-hidden group">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#06B6D4] to-[#8B5CF6] flex items-center justify-center text-xs font-bold text-black shrink-0">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div className="truncate">
                  <p className="text-xs font-semibold text-white group-hover:text-[#06B6D4] transition-colors truncate">
                    {user.username}
                  </p>
                  <p className="text-[10px] text-[#64748B] truncate">{user.email}</p>
                </div>
              </a>
              <button
                onClick={handleLogout}
                title="Encerrar sessão"
                className="p-1.5 rounded-lg hover:bg-[#181C2B] text-[#94A3B8] hover:text-rose-400 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="pt-2 border-t border-[#1E2337]/60 grid grid-cols-2 gap-2">
              <a
                href="/login"
                className="text-center text-xs py-2 rounded-lg bg-[#181C2B] hover:bg-[#262C3F] text-[#F3F4F6] font-medium border border-[#262C3F] transition-colors"
              >
                Entrar
              </a>
              <a
                href="/register"
                className="text-center text-xs py-2 rounded-lg bg-[#06B6D4] hover:bg-[#22D3EE] text-black font-semibold transition-colors"
              >
                Cadastrar
              </a>
            </div>
          )}
        </div>
      </aside>

      {/* 3. CONTEÚDO PRINCIPAL (Main Area) */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-0">
        <main id="main-content" role="main" className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
        <LegalFooter />
      </div>

      {/* 4. BOTTOM NAVIGATION BAR MOBILE (< 1024px) */}
      <nav
        role="navigation"
        aria-label="Navegação Móvel"
        className="lg:hidden fixed bottom-0 inset-x-0 h-16 bg-[#0E111B]/95 backdrop-blur border-t border-[#1E2337] flex items-center justify-around z-50 px-2"
      >
        {navItems.map((item) => (
          <a
            key={item.name}
            href={item.href}
            className={`flex flex-col items-center justify-center w-16 py-1 rounded-lg transition-colors ${
              item.isActive
                ? 'text-[#06B6D4] font-semibold'
                : 'text-[#64748B] hover:text-[#94A3B8]'
            }`}
          >
            {item.icon}
            <span className="text-[10px] mt-1">{item.name}</span>
          </a>
        ))}
      </nav>
    </div>
  );
}
