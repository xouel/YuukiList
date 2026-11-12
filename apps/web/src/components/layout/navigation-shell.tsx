'use client';

/**
 * YuukiList — Casca de Navegação Responsiva (Top Command Bar Desktop + Bottom Nav Mobile)
 * Conforme Seções 3.2, 3.3 e 11.1 do Documento Mestre de Contexto e Slices 018 / 023 (Consolidated Product UI)
 * Paleta Mineral: var(--color-bg-surface) e var(--color-border)
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../context/auth-context.tsx';
import { ThemeToggle } from './theme-toggle.tsx';
import { LegalFooter } from './legal-footer.tsx';
import { NotificationBell } from '../notifications/notification-bell.tsx';

interface NavigationShellProps {
  children: React.ReactNode;
}

export function NavigationShell({ children }: NavigationShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const isLogin = pathname === '/login';
  const isRegister = pathname === '/register';

  const navItems = [
    {
      name: 'Início',
      href: '/',
      isActive: pathname === '/',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      name: 'Biblioteca',
      href: '/library',
      isActive: pathname === '/library',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
      ),
    },
    {
      name: 'Explorar',
      href: '/explore',
      isActive: pathname === '/explore' || pathname.startsWith('/items'),
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
    {
      name: 'Calendário',
      href: '/calendar',
      isActive: pathname === '/calendar',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      name: 'Perfil',
      href: '/profile',
      isActive: pathname === '/profile',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg-base)] text-[var(--color-text-primary)] transition-colors duration-200 font-sans-ui">
      {/* 1. TOP COMMAND BAR DESKTOP & HEADER MOBILE */}
      <header className="sticky top-0 z-40 h-16 w-full border-b border-stroke-subtle bg-surface-raised/95 backdrop-blur-md shadow-hairline-top transition-colors">
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Logo / Wordmark */}
          <div className="flex items-center gap-6 shrink-0">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="font-serif-editorial font-bold text-2xl tracking-wider text-[var(--color-text-primary)] group-hover:text-accent transition-colors">
                YUUKILIST
              </span>
              <span className="hidden xl:inline-block text-[10px] font-medium tracking-widest uppercase text-[var(--color-text-muted)] border-l border-stroke-subtle pl-2">
                Catálogo Asiático
              </span>
            </Link>

            {/* Links Centrais Desktop (>= 1024px) */}
            <nav role="navigation" aria-label="Navegação Principal" className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-colors ${
                    item.isActive
                      ? 'bg-accent/15 text-accent border border-accent/40 shadow-sm'
                      : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-surface-overlay'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Busca Global Rápida (Desktop & Tablet) */}
          <div className="hidden sm:flex flex-1 max-w-md mx-2">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[var(--color-text-muted)]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar animes, doramas, mangás, filmes..."
                className="w-full pl-9 pr-4 py-1.5 text-xs rounded-full bg-surface-canvas border border-stroke-subtle text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
              />
            </form>
          </div>

          {/* Ações à Direita: Notificações, Tema & Sessão do Usuário */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="flex items-center gap-1.5" title="Notificações & Aparência">
              {isAuthenticated && <NotificationBell />}
              <ThemeToggle />
            </div>

            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1 rounded-full hover:bg-surface-overlay transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
                  aria-expanded={isUserMenuOpen}
                  aria-label="Menu do Usuário"
                >
                  <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-xs font-bold text-white shadow-sm shrink-0">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden md:inline-block text-xs font-medium text-[var(--color-text-primary)] max-w-[100px] truncate">
                    {user.username}
                  </span>
                  <svg className="w-3.5 h-3.5 text-[var(--color-text-muted)] hidden md:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isUserMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-48 rounded-xl bg-surface-raised border border-stroke-subtle shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150"
                    onMouseLeave={() => setIsUserMenuOpen(false)}
                  >
                    <div className="px-3 py-2 border-b border-stroke-subtle mb-1">
                      <p className="text-xs font-bold text-[var(--color-text-primary)] truncate">{user.username}</p>
                      <p className="text-[10px] text-[var(--color-text-muted)] truncate">{user.email}</p>
                    </div>
                    <Link
                      href="/profile"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-surface-overlay transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Meu Perfil
                    </Link>
                    <Link
                      href="/library"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-surface-overlay transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                      Minha Lista
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full text-left flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-400 hover:bg-rose-950/20 transition-colors mt-1 border-t border-stroke-subtle pt-2"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Encerrar Sessão
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                    isLogin
                      ? 'bg-accent text-white shadow-sm'
                      : 'bg-surface-overlay text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] border border-stroke-subtle'
                  }`}
                >
                  Entrar
                </Link>
                <Link
                  href="/register"
                  className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                    isRegister
                      ? 'bg-accent text-white shadow-sm'
                      : 'bg-accent/15 hover:bg-accent text-accent hover:text-white border border-accent/40 shadow-sm'
                  }`}
                >
                  Cadastrar
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. CONTEÚDO PRINCIPAL (Main Area — Container max-w-7xl Uniforme) */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-0">
        <main id="main-content" role="main" className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
        <LegalFooter />
      </div>

      {/* 3. BOTTOM NAVIGATION BAR MOBILE (< 1024px) */}
      <nav
        role="navigation"
        aria-label="Navegação Móvel"
        className="lg:hidden fixed bottom-0 inset-x-0 h-16 bg-surface-raised/95 backdrop-blur-md border-t border-stroke-subtle shadow-hairline-top flex items-center justify-around z-50 px-2 transition-colors"
      >
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`flex flex-col items-center justify-center w-16 py-1 rounded-lg transition-colors ${
              item.isActive
                ? 'text-[var(--color-accent)] font-semibold'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
            }`}
          >
            {item.icon}
            <span className="text-[10px] mt-1">{item.name}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
