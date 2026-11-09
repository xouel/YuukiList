import React from 'react';
import './globals.css';
import { AuthProvider } from '../context/auth-context.tsx';
import { NavigationShell } from '../components/layout/navigation-shell.tsx';

export const metadata = {
  title: 'YuukiList — Catálogo Unificado de Entretenimento Asiático',
  description: 'Acompanhe doramas, filmes, animes, mangás, manhwas e manhuas em um catálogo rápido, unificado e sem anúncios.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="bg-[#080A11] text-[#F3F4F6] min-h-screen antialiased selection:bg-[#06B6D4] selection:text-black">
        <AuthProvider>
          {/* WCAG 2.2 AA: Link de salto para o conteúdo principal para navegadores por teclado */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#06B6D4] focus:text-black focus:font-semibold focus:rounded focus:outline-none"
          >
            Pular para o conteúdo principal
          </a>

          {/* Casca de Navegação Responsiva (Sidebar Desktop + Bottom Nav Mobile) */}
          <NavigationShell>
            {children}
          </NavigationShell>
        </AuthProvider>
      </body>
    </html>
  );
}
