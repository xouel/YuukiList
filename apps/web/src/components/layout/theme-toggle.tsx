'use client';

/**
 * YuukiList — Alternador de Tema Visual (Dark Editorial / Light Editorial)
 * Conforme Seção 11.1 do Documento Mestre de Contexto e WCAG 2.2 AA
 */

import React, { useEffect, useState } from 'react';

export type ThemeMode = 'dark' | 'light';

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    // Recupera preferência do localStorage ou sistema
    const saved = localStorage.getItem('yuuki-theme') as ThemeMode | null;
    if (saved === 'light' || saved === 'dark') {
      setTheme(saved);
      applyTheme(saved);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initial = prefersDark ? 'dark' : 'dark'; // Dark Editorial como baseline
      setTheme(initial);
      applyTheme(initial);
    }
  }, []);

  const applyTheme = (newTheme: ThemeMode) => {
    const root = document.documentElement;
    root.setAttribute('data-theme', newTheme);
    if (newTheme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
    }
  };

  const toggleTheme = () => {
    const next: ThemeMode = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('yuuki-theme', next);
    applyTheme(next);
  };

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-lg bg-surface-raised animate-pulse" aria-hidden="true" />
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={theme === 'dark' ? 'Mudar para Tema Claro' : 'Mudar para Tema Escuro'}
      aria-label={theme === 'dark' ? 'Alternar para tema claro' : 'Alternar para tema escuro'}
      className="p-2 rounded-lg bg-surface-raised hover:bg-surface-overlay text-[var(--color-text-primary)] border border-stroke-subtle transition-colors focus-visible:ring-2 focus-visible:ring-accent flex items-center justify-center cursor-pointer shadow-sm"
    >
      {theme === 'dark' ? (
        // Ícone Sol (para ir para Light)
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4 text-amber-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ) : (
        // Ícone Lua (para ir para Dark)
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4 text-[#8B5CF6]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      )}
    </button>
  );
}

