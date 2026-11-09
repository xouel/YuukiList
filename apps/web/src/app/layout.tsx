import React from 'react';
import './globals.css';

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
      <body className="bg-[#0B0D13] text-[#F3F4F6] min-h-screen flex flex-col antialiased selection:bg-[#06B6D4] selection:text-black">
        {/* WCAG 2.2 AA: Link de salto para o conteúdo principal para navegadores por teclado */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#06B6D4] focus:text-black focus:font-semibold focus:rounded focus:outline-none"
        >
          Pular para o conteúdo principal
        </a>

        {/* Cabeçalho Minimalista Dark Editorial */}
        <header role="banner" className="border-b border-[#262C3F] bg-[#121520]/80 backdrop-blur sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <a
              href="/"
              className="flex items-center gap-2 text-xl font-bold tracking-tight text-[#F3F4F6] hover:text-[#06B6D4] transition-colors focus-visible:ring-2 focus-visible:ring-[#06B6D4] rounded"
              aria-label="YuukiList Início"
            >
              <span className="text-[#06B6D4]">雪</span>
              <span>YuukiList</span>
            </a>

            <nav role="navigation" aria-label="Navegação Principal" className="flex items-center gap-6">
              <a
                href="/"
                className="text-sm font-medium text-[#F3F4F6] hover:text-[#06B6D4] transition-colors focus-visible:ring-2 focus-visible:ring-[#06B6D4] rounded px-2 py-1"
              >
                Catálogo
              </a>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#181C2B] text-[#9CA3AF] border border-[#262C3F]">
                MVP Fase 1
              </span>
            </nav>
          </div>
        </header>

        {/* Conteúdo Principal */}
        <main id="main-content" role="main" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

        {/* Rodapé */}
        <footer role="contentinfo" className="border-t border-[#262C3F] bg-[#0B0D13] py-6 text-center text-xs text-[#6B7280]">
          <div className="max-w-7xl mx-auto px-4">
            <p>YuukiList — Plataforma Soberana de Entretenimento Asiático. Custo R$ 0 permanente.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}

