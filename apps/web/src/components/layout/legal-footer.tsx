import React from 'react';

/**
 * YuukiList — Rodapé de Atribuição Legal e Proveniência de Dados
 * Conforme Seções 9.3, 9.4, 9.6, 9.7 e 11.1 do Documento Mestre de Contexto e Slice 018
 */

export function LegalFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-bg-surface)]/60 text-[var(--color-text-muted)] py-8 px-4 sm:px-6 lg:px-8 mt-16 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Identidade e Soberania */}
        <div className="flex flex-col items-center md:items-start gap-1.5 text-center md:text-left">
          <div className="flex items-center gap-2">
            <span className="font-serif-editorial font-bold text-sm tracking-wide text-[var(--color-text-primary)]">
              YUUKILIST
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-bg-card)] text-[var(--color-accent)] font-medium border border-[var(--color-border)]">
              Privacidade & Seus Dados
            </span>
          </div>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Plataforma unificada de acompanhamento e catálogo de entretenimento asiático.
          </p>
          <p className="text-[11px] text-[var(--color-text-muted)]">
            © {currentYear} YuukiList. Capas locais vetoriais geradas internamente. Sem player de vídeo ou leitor pirata.
          </p>
        </div>

        {/* Atribuição Obrigatória das APIs Parceiras */}
        <div className="flex flex-col items-center md:items-end gap-1.5 text-center md:text-right max-w-md">
          <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed">
            Este produto utiliza dados das APIs públicas do{' '}
            <strong className="text-[var(--color-text-primary)]">TMDB</strong>,{' '}
            <strong className="text-[var(--color-text-primary)]">TVmaze</strong>,{' '}
            <strong className="text-[var(--color-text-primary)]">Kitsu</strong>,{' '}
            <strong className="text-[var(--color-text-primary)]">Anime News Network</strong> e{' '}
            <strong className="text-[var(--color-text-primary)]">MangaUpdates</strong>.
          </p>
          <p className="text-[10px] text-[var(--color-text-muted)] italic">
            This product uses the TMDB API but is not endorsed or certified by TMDB.
          </p>
        </div>
      </div>
    </footer>
  );
}
