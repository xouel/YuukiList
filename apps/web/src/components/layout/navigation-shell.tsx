'use client';

/**
 * YuukiList — Casca de Navegação Responsiva (Sidebar Desktop + Bottom Nav Mobile)
 * Conforme Seções 3.2, 3.3 e 11.1 do Documento Mestre de Contexto e Slice 018 (Asian Editorial)
 */

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../context/auth-context.tsx';
import { ThemeToggle } from './theme-toggle.tsx';
import { LegalFooter } from './legal-footer.tsx';
import { NotificationBell } from '../notifications/notification-bell.tsx';

interface NavigationShellProps {
  children: React.ReactNode;
}

export function NavigationShell({ children }: NavigationShellProps) {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();

  const isLogin = pathname === '/login';
  const isRegister = pathname === '/register';

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
    <div className="min-h-screen flex flex-col lg:flex-row bg-[var(--color-bg-base)] text-[var(--color-text-primary)] transition-colors duration-200 font-sans-ui">
      {/* 1. TOP HEADER MOBILE (< 1024px) */}
      <header className="lg:hidden h-14 border-b border-[var(--color-border)] bg-[var(--color-bg-surface)]/90 backdrop-blur px-4 flex items-center justify-between sticky top-0 z-40 transition-colors">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-serif-editorial font-bold text-xl tracking-wide text-[var(--color-text-primary)]">
            YUUKILIST
          </span>
        </Link>
        <div className="flex items-center gap-2">
          {isAuthenticated && <NotificationBell />}
          <ThemeToggle />
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="text-xs px-2.5 py-1 rounded bg-[var(--color-bg-card)] text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:bg-[var(--color-bg-card-hover)] transition-colors"
            >
              Sair
            </button>
          ) : isLogin ? (
            <Link
              href="/register"
              className="text-xs px-3 py-1.5 rounded-lg bg-[#E05347] hover:bg-[#C8453B] text-white font-semibold shadow-sm transition-colors"
            >
              Cadastrar
            </Link>
          ) : (
            <Link
              href="/login"
              className="text-xs px-3 py-1.5 rounded-lg bg-[#E05347] hover:bg-[#C8453B] text-white font-semibold shadow-sm transition-colors"
            >
              Entrar
            </Link>
          )}
        </div>
      </header>

      {/* 2. SIDEBAR DESKTOP (>= 1024px) */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-[var(--color-border)] bg-[var(--color-bg-surface)] shrink-0 sticky top-0 h-screen z-30 transition-colors">
        {/* Wordmark Tipográfico Minimalista (Asian Editorial) */}
        <div className="p-6 border-b border-[var(--color-border)]">
          <Link href="/" className="block group">
            <span className="font-serif-editorial font-bold text-2xl tracking-wide text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors">
              YUUKILIST
            </span>
            <span className="block text-xs font-medium tracking-wider text-[var(--color-text-secondary)] mt-0.5">
              Catálogo Asiático
            </span>
          </Link>
        </div>

        {/* Links Principais (4 Áreas Unificadas) */}
        <nav role="navigation" aria-label="Navegação Desktop" className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                item.isActive
                  ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent)] font-semibold border border-[var(--color-accent)]/30 shadow-sm'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-card)]'
              }`}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* Rodapé da Sidebar: Sessão do Usuário, Notificações & Aparência */}
        <div className="p-4 border-t border-[var(--color-border)] space-y-3 bg-[var(--color-bg-surface)] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--color-text-muted)]">Notificações & Aparência</span>
            <div className="flex items-center gap-1.5">
              {isAuthenticated && <NotificationBell />}
              <ThemeToggle />
            </div>
          </div>

          {isAuthenticated && user ? (
            <div className="pt-2 border-t border-[var(--color-border)]/60 flex items-center justify-between">
              <Link href="/profile" className="flex items-center gap-2.5 overflow-hidden group">
                <div className="w-8 h-8 rounded-full bg-[var(--color-accent)] flex items-center justify-center text-xs font-bold text-white shrink-0">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div className="truncate">
                  <p className="text-xs font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors truncate">
                    {user.username}
                  </p>
                  <p className="text-[10px] text-[var(--color-text-muted)] truncate">{user.email}</p>
                </div>
              </Link>
              <button
                onClick={handleLogout}
                title="Encerrar sessão"
                className="p-1.5 rounded-lg hover:bg-[var(--color-bg-card)] text-[var(--color-text-secondary)] hover:text-rose-400 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="pt-2 border-t border-[var(--color-border)]/60 grid grid-cols-2 gap-2">
              <Link
                href="/login"
                className={`text-center text-xs py-2 rounded-lg font-medium transition-colors ${
                  isLogin
                    ? 'bg-[#E05347] hover:bg-[#C8453B] text-white font-semibold shadow-sm'
                    : 'bg-[var(--color-bg-card)] hover:bg-[var(--color-bg-card-hover)] text-[var(--color-text-primary)] border border-[var(--color-border)]'
                }`}
              >
                Entrar
              </Link>
              <Link
                href="/register"
                className={`text-center text-xs py-2 rounded-lg font-medium transition-colors ${
                  isRegister || !isLogin
                    ? 'bg-[#E05347] hover:bg-[#C8453B] text-white font-semibold shadow-sm'
                    : 'bg-[var(--color-bg-card)] hover:bg-[var(--color-bg-card-hover)] text-[var(--color-text-primary)] border border-[var(--color-border)]'
                }`}
              >
                Cadastrar
              </Link>
            </div>
          )}
        </div>
      </aside>

      {/* 3. CONTEÚDO PRINCIPAL (Main Area — Container max-w-7xl Uniforme) */}
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
        className="lg:hidden fixed bottom-0 inset-x-0 h-16 bg-[var(--color-bg-surface)]/95 backdrop-blur border-t border-[var(--color-border)] flex items-center justify-around z-50 px-2 transition-colors"
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
